#!/bin/bash

#downloads configure-linux.sh
echo "INFO: Downloading dependencies - configure-linux.sh"
curl -s -o configure-linux.sh https://www.loggly.com/install/configure-linux.sh
source configure-linux.sh "being-invoked"

##########  Variable Declarations - Start  ##########
#name of the current script
SCRIPT_NAME=configure-file-monitoring.sh
#version of the current script
SCRIPT_VERSION=1.15

#file to monitor (contains complete path and file name) provided by user
LOGGLY_FILE_TO_MONITOR=

#alias name, will be used as tag & state file name etc. provided by user
LOGGLY_FILE_TO_MONITOR_ALIAS=
FILE_ALIAS=
STATE_FILE_ALIAS=

#file alias provided by the user
APP_TAG="\"file-alias\":\"\""

#name and location of syslog file
FILE_SYSLOG_CONFFILE=

#name and location of syslog backup file
FILE_SYSLOG_CONFFILE_BACKUP=

MANUAL_CONFIG_INSTRUCTION="Manual instructions to configure a file is available at https://www.loggly.com/docs/file-monitoring/. Rsyslog troubleshooting instructions are available at https://www.loggly.com/docs/troubleshooting-rsyslog/"

#this variable is set if the script is invoked via some other calling script
IS_FILE_MONITOR_SCRIPT_INVOKED="false"

#file as tag sent with the logs
LOGGLY_FILE_TAG="file"

#format name for the conf file. Can be set by calling script
CONF_FILE_FORMAT_NAME="LogglyFormatFile"

#add tags to the logs
TAG=

FILE_TO_MONITOR=

IS_DIRECTORY=

IS_WILDCARD=

FILE_TLS_SENDING="true"

##########  Variable Declarations - End  ##########

# executing the script for loggly to install and configure syslog
installLogglyConfForFile() {
  #log message indicating starting of Loggly configuration
  logMsgToConfigSysLog "INFO" "INFO: Initiating configure Loggly for file monitoring."

  #check if the linux environment is compatible for Loggly
  checkLinuxLogglyCompatibility

  #checks if the file name contain spaces, if yes, the exit
  checkIfFileLocationContainSpaces

  if [ "$IS_DIRECTORY" == "true" ]; then

    configureDirectoryFileMonitoring

  else

    #check if file to monitor exists
    checkIfFileExist

    #construct variables using filename and filealias
    constructFileVariables

    #check if the alias is already taken
    checkIfFileAliasExist

    #check for the log file size
    checkLogFileSize $LOGGLY_FILE_TO_MONITOR

    #checks if the file has proper read permission
    checkFileReadPermission

    #configure loggly for Linux
    installLogglyConf

    #multiple tags
    addTagsInConfiguration

    #create 21<file alias>.conf file
    write21ConfFileContents

  fi

  #restart rsyslog
  restartRsyslog

  #verify if the file logs made it to loggly
  checkIfFileLogsMadeToLoggly

  if [ "$IS_FILE_MONITOR_SCRIPT_INVOKED" = "false" ]; then
    #log success message
    logMsgToConfigSysLog "SUCCESS" "SUCCESS: Successfully configured to send $LOGGLY_FILE_TO_MONITOR logs via Loggly."
  fi
}

#executing script to remove loggly configuration for File
removeLogglyConfForFile() {
  logMsgToConfigSysLog "INFO" "INFO: Initiating rollback."

  #check if the user has root permission to run this script
  checkIfUserHasRootPrivileges

  #check if the OS is supported by the script. If no, then exit
  checkIfSupportedOS

  #construct variables using filename and filealias
  constructFileVariables

  #checks if the conf file exists. if not, then exit.
  checkIfConfFileExist

  #remove 21<file-alias>.conf file
  remove21ConfFile

  #restart rsyslog
  restartRsyslog

  removeStatFile

  #log success message
  logMsgToConfigSysLog "SUCCESS" "SUCCESS: Rollback completed."
}

checkIfFileLocationContainSpaces() {
  case "$LOGGLY_FILE_TO_MONITOR" in
  *\ *)
    logMsgToConfigSysLog "ERROR" "ERROR: File location cannot contain spaces."
    exit 1
    ;;
  *) ;;
  esac
}

constructFileVariables() {
  #conf file name
  FILE_SYSLOG_CONFFILE="$RSYSLOG_ETCDIR_CONF/21-filemonitoring-$FILE_ALIAS.conf"

  #conf file backup name
  FILE_SYSLOG_CONFFILE_BACKUP="$RSYSLOG_ETCDIR_CONF/$FILE_ALIAS.loggly.bk"

  #application tag
  APP_TAG="\"file-alias\":\"$LOGGLY_FILE_TO_MONITOR_ALIAS\""
}

#configures the directory files for file monitoring
configureDirectoryFileMonitoring() {
  addTagsInConfiguration
  TOTAL_FILES_IN_DIR=$(ls -1 ${LOGGLY_FILE_TO_MONITOR} | wc -l)
  logMsgToConfigSysLog "INFO" "INFO: There are $TOTAL_FILES_IN_DIR files in directory. Configuring each file for monitoring present in this directory."
  if [ "$SUPPRESS_PROMPT" == "false" ]; then
    while true; do
      read -p "There are $TOTAL_FILES_IN_DIR files present in this directory. Would you like to configure all the files (yes/no)?" yn
      case $yn in
      [Yy]*)
        installLogglyConf
        for file in $(find $LOGGLY_FILE_TO_MONITOR -name '*'); do
          configureFilesPresentInDirectory $file $FILE_ALIAS
        done
        break
        ;;
      [Nn]*)
        exit 1
        break
        ;;
      *) echo "Please answer yes or no." ;;
      esac
    done
    while true; do
      read -p "Would you like install a Cron job to sync the files currently in your Directory every 10 minutes? (yes/no)" yn
      case $yn in
      [Yy]*)
        doCronInstallation
        break
        ;;
      [Nn]*)
        logMsgToConfigSysLog "INFO" "INFO: Skipping Cron installation."
        break
        ;;
      *) echo "Please answer yes or no." ;;
      esac
    done
  else
    installLogglyConf
    for file in $(find $LOGGLY_FILE_TO_MONITOR -name '*'); do
      configureFilesPresentInDirectory $file $FILE_ALIAS
    done
    if [[ ! -f "/root/.loggly/file-monitoring-cron-$FILE_ALIAS.sh" ]]; then
      doCronInstallation
    fi
  fi
}

#actually configures a file present in the directory for monitoring
configureFilesPresentInDirectory() {
  FILE_TO_MONITOR=$1
  fileNameWithExt=${1##*/}
  uniqueFileName=$(echo "$fileNameWithExt" | tr . _)
  var=$(file $FILE_TO_MONITOR)

  #checking if it is a text file otherwise ignore it
  #it may be possible that the "text" may contain some uppercase letters like "Text"
  var=$(echo $var | tr "[:upper:]" "[:lower:]")
  if [[ $var == *text* ]]; then
    LOGGLY_FILE_TO_MONITOR_ALIAS=$uniqueFileName-$2
    if [ -f ${FILE_TO_MONITOR} ]; then
      constructFileVariables
      checkFileReadPermission
      checkLogFileSize $FILE_TO_MONITOR
      STATE_FILE_ALIAS=$(echo -n "$uniqueFileName" | md5sum | tr -d ' ')$FILE_ALIAS
      write21ConfFileContents
    fi
  fi
}

checkIfWildcardExist() {
  TOTAL_FILES_IN_DIR=$(ls -1 ${LOGGLY_FILE_TO_MONITOR} 2>/dev/null | wc -l)
  WILDCARDS=('*' '.' '?' '|' ']' '[')
  for WILDCARD in "${WILDCARDS[@]}"; do
    if [[ $LOGGLY_FILE_TO_MONITOR == *"${WILDCARD}"* && $TOTAL_FILES_IN_DIR -gt 0 ]]; then
      IS_WILDCARD="true"
      return 0
    else
      return 1
    fi
  done
}

#checks if the file to be monitored exist
checkIfFileExist() {
  if [ -f "$LOGGLY_FILE_TO_MONITOR" ]; then
    logMsgToConfigSysLog "INFO" "INFO: File $LOGGLY_FILE_TO_MONITOR exists."
  else
    logMsgToConfigSysLog "ERROR" "ERROR: File $LOGGLY_FILE_TO_MONITOR does not exist. Kindly recheck."
    exit 1
  fi
}

#deletes the state file for the current alias, if exists
deleteStateFile() {
  restartRsyslog
  sudo rm -f $RSYSLOG_DIR/stat-$FILE_ALIAS
  restartRsyslog
}

#check if the file alias is already taken
checkIfFileAliasExist() {
  if [ -f "$FILE_SYSLOG_CONFFILE" ]; then
    logMsgToConfigSysLog "WARN" "WARN: This file alias is already taken. You must choose a unique file alias for each file."
    if [ "$SUPPRESS_PROMPT" == "false" ]; then
      while true; do
        read -p "Would you like to overwrite the configuration for this file alias (yes/no)?" yn
        case $yn in
        [Yy]*)
          logMsgToConfigSysLog "INFO" "INFO: Going to back up the conf file: $FILE_SYSLOG_CONFFILE to $FILE_SYSLOG_CONFFILE_BACKUP"
          sudo mv -f $FILE_SYSLOG_CONFFILE $FILE_SYSLOG_CONFFILE_BACKUP
          deleteStateFile
          break
          ;;
        [Nn]*)
          logMsgToConfigSysLog "INFO" "INFO: Not overwriting the existing configuration. Exiting"
          exit 1
          break
          ;;
        *) echo "Please answer yes or no." ;;
        esac
      done
    else
      logMsgToConfigSysLog "INFO" "INFO: Going to back up the conf file: $FILE_SYSLOG_CONFFILE to $FILE_SYSLOG_CONFFILE_BACKUP"
      sudo mv -f $FILE_SYSLOG_CONFFILE $FILE_SYSLOG_CONFFILE_BACKUP
      deleteStateFile
    fi
  fi
}

#check the size of the log file. If the size is greater than 100MB give a warning to the user. If the file size is 0
#then exit
checkLogFileSize() {
  monitorFileSize=$(wc -c "$1" | cut -f 1 -d ' ')
  if [ $monitorFileSize -ge 102400000 ]; then
    if [ "$SUPPRESS_PROMPT" == "false" ]; then
      while true; do
        read -p "WARN: There are currently large log files which may use up your allowed volume. Please rotate your logs before continuing. Would you like to continue now anyway? (yes/no)" yn
        case $yn in
        [Yy]*)
          logMsgToConfigSysLog "INFO" "INFO: Current size of $LOGGLY_FILE_TO_MONITOR is $monitorFileSize bytes. Continuing with File Loggly configuration."
          break
          ;;
        [Nn]*)
          logMsgToConfigSysLog "INFO" "INFO: Current size of $LOGGLY_FILE_TO_MONITOR is $monitorFileSize bytes. Discontinuing with File Loggly configuration."
          exit 1
          break
          ;;
        *) echo "Please answer yes or no." ;;
        esac
      done
    else
      logMsgToConfigSysLog "WARN" "WARN: There are currently large log files which may use up your allowed volume."
      logMsgToConfigSysLog "INFO" "INFO: Current size of $LOGGLY_FILE_TO_MONITOR is $monitorFileSize bytes. Continuing with File Loggly configuration."
    fi
  elif [ $monitorFileSize -eq 0 ]; then
    logMsgToConfigSysLog "WARN" "WARN: There are no recent logs from $LOGGLY_FILE_TO_MONITOR so there won't be any data sent to Loggly. You can generate some logs by writing to this file."
    exit 1
  else
    logMsgToConfigSysLog "INFO" "INFO: File size of $FILE_TO_MONITOR is $monitorFileSize bytes."
  fi
}

#checks the input file has proper read permissions
checkFileReadPermission() {
  LINUX_DIST_IN_LOWER_CASE=$(echo $LINUX_DIST | tr "[:upper:]" "[:lower:]")
  #no need to check read permissions with RedHat and CentOS as they also work with ---------- (000)permissions
  case "$LINUX_DIST_IN_LOWER_CASE" in
  *"redhat"*) ;;

  *"centos"*) ;;

  *)
    FILE_PERMISSIONS=$(ls -l $LOGGLY_FILE_TO_MONITOR)
    #checking if the file has read permission for others
    PERMISSION_READ_OTHERS=${FILE_PERMISSIONS:7:1}
    if [[ $PERMISSION_READ_OTHERS != r ]]; then
      logMsgToConfigSysLog "WARN" "WARN: $LOGGLY_FILE_TO_MONITOR does not have proper read permissions. Verification step may fail."
    fi
    ;;
  esac
}

addTagsInConfiguration() {
  #split tags by comman(,)
  IFS=, read -a array <<<"$LOGGLY_FILE_TAG"
  for i in "${array[@]}"; do
    TAG="$TAG tag=\\\"$i\\\" "
  done
}

doCronInstallation() {
  if [[ ! -d "/root/.loggly" ]]; then
    mkdir /root/.loggly
  fi
  CRON_SCRIPT="/root/.loggly/file-monitoring-cron-$FILE_ALIAS.sh"
  logMsgToConfigSysLog "INFO" "INFO: Creating cron script $CRON_SCRIPT"

  sudo touch $CRON_SCRIPT
  sudo chmod +x $CRON_SCRIPT

  cronScriptStr="#!/bin/bash
curl -s -o configure-file-monitoring.sh https://www.loggly.com/install/configure-file-monitoring.sh
sudo mv -f $FILE_SYSLOG_CONFFILE $FILE_SYSLOG_CONFFILE.bk
sudo rm -f $FILE_SYSLOG_CONFFILE
sudo bash configure-file-monitoring.sh -a $LOGGLY_ACCOUNT -u $LOGGLY_USERNAME -p $LOGGLY_PASSWORD -f $LOGGLY_FILE_TO_MONITOR -l $FILE_ALIAS -tag $LOGGLY_FILE_TAG -s
"
  #write to cron script file

  sudo cat <<EOIPFW >>$CRON_SCRIPT
$cronScriptStr
EOIPFW

  CRON_JOB_TO_MONITOR_FILES="*/10 * * * * sudo bash $CRON_SCRIPT"
  CRON_FILE="/tmp/File_Monitor_Cron"

  EXISTING_CRONS=$(sudo crontab -l 2>&1)
  case $EXISTING_CRONS in
  no*) ;;

  *)
    echo "$EXISTING_CRONS" >>$CRON_FILE
    ;;
  esac

  echo "$CRON_JOB_TO_MONITOR_FILES" >>$CRON_FILE
  sudo crontab $CRON_FILE
  sudo rm -fr $CRON_FILE
}

#function to write the contents of syslog config file
write21ConfFileContents() {
  logMsgToConfigSysLog "INFO" "INFO: Creating file $FILE_SYSLOG_CONFFILE"
  sudo touch $FILE_SYSLOG_CONFFILE
  sudo chmod o+w $FILE_SYSLOG_CONFFILE

  rsyslog_version="$(rsyslogd -v)"
  r_ver=${rsyslog_version:9:1}
  if [ $r_ver -le 7 ]; then
    imfileStr="
            \$ModLoad imfile
            \$InputFilePollInterval 10
            \$WorkDirectory $RSYSLOG_DIR
            \$ActionSendStreamDriver gtls
            \$ActionSendStreamDriverMode 1
            \$ActionSendStreamDriverAuthMode x509/name
            \$ActionSendStreamDriverPermittedPeer *.loggly.com

            #RsyslogGnuTLS
            \$DefaultNetstreamDriverCAFile /etc/rsyslog.d/keys/ca.d/logs-01.loggly.com_sha12.crt

            # File access file:
            \$InputFileName $FILE_TO_MONITOR
            \$InputFileTag $LOGGLY_FILE_TO_MONITOR_ALIAS
            \$InputFileStateFile stat-$STATE_FILE_ALIAS
            \$InputFileSeverity info
            \$InputFilePersistStateInterval 20000
            \$InputRunFileMonitor
            
            #Add a tag for file events
            template (name=\"$CONF_FILE_FORMAT_NAME\" type=\"string\" string=\"<%pri%>%protocol-version% %timestamp:::date-rfc3339% %HOSTNAME% %app-name% %procid% %msgid% [$LOGGLY_AUTH_TOKEN@41058 $TAG] %msg%\n\")
            
            if \$programname == '$LOGGLY_FILE_TO_MONITOR_ALIAS' then action(type=\"omfwd\" protocol=\"tcp\" target=\"logs-01.loggly.com\" port=\"6514\" template=\"$CONF_FILE_FORMAT_NAME\")
            if \$programname == '$LOGGLY_FILE_TO_MONITOR_ALIAS' then stop
        "
    imfileStrNonTls="
            \$ModLoad imfile
            \$InputFilePollInterval 10
            \$WorkDirectory $RSYSLOG_DIR
            
            # File access file:
            \$InputFileName $FILE_TO_MONITOR
            \$InputFileTag $LOGGLY_FILE_TO_MONITOR_ALIAS
            \$InputFileStateFile stat-$STATE_FILE_ALIAS
            \$InputFileSeverity info
            \$InputFilePersistStateInterval 20000
            \$InputRunFileMonitor
            
            #Add a tag for file events
            template (name=\"$CONF_FILE_FORMAT_NAME\" type=\"string\" string=\"<%pri%>%protocol-version% %timestamp:::date-rfc3339% %HOSTNAME% %app-name% %procid% %msgid% [$LOGGLY_AUTH_TOKEN@41058 $TAG] %msg%\n\")
            
            if \$programname == '$LOGGLY_FILE_TO_MONITOR_ALIAS' then action(type=\"omfwd\" protocol=\"tcp\" target=\"logs-01.loggly.com\" port=\"514\" template=\"$CONF_FILE_FORMAT_NAME\")
            if \$programname == '$LOGGLY_FILE_TO_MONITOR_ALIAS' then stop
        "
  else
    imfileStr="
            module(load=\"imfile\")

            #RsyslogGnuTLS
            \$DefaultNetstreamDriverCAFile /etc/rsyslog.d/keys/ca.d/logs-01.loggly.com_sha12.crt

            # Input for FILE1
            input(type=\"imfile\" tag=\"$LOGGLY_FILE_TO_MONITOR_ALIAS\" ruleset=\"filelog\" file=\"$FILE_TO_MONITOR\") #wildcard is allowed at file level only

            # Add a tag for file events
            template(name=\"$CONF_FILE_FORMAT_NAME\" type=\"string\" string=\"<%pri%>%protocol-version% %timestamp:::date-rfc3339% %HOSTNAME% %app-name% %procid% %msgid% [$LOGGLY_AUTH_TOKEN@41058 $TAG] %msg%\n\")

            ruleset(name=\"filelog\"){
            action(type=\"omfwd\" protocol=\"tcp\" target=\"logs-01.loggly.com\" port=\"6514\" template=\"$CONF_FILE_FORMAT_NAME\" StreamDriver=\"gtls\" StreamDriverMode=\"1\" StreamDriverAuthMode=\"x509/name\" StreamDriverPermittedPeers=\"*.loggly.com\")
            }
        "
    imfileStrNonTls="
        
            module(load=\"imfile\")

            # Input for FILE1
            input(type=\"imfile\" tag=\"$LOGGLY_FILE_TO_MONITOR_ALIAS\" ruleset=\"filelog\" file=\"$FILE_TO_MONITOR\") #wildcard is allowed at file level only

            # Add a tag for file events
            template(name=\"$CONF_FILE_FORMAT_NAME\" type=\"string\" string=\"<%pri%>%protocol-version% %timestamp:::date-rfc3339% %HOSTNAME% %app-name% %procid% %msgid% [$LOGGLY_AUTH_TOKEN@41058 $TAG] %msg%\n\")

            ruleset(name=\"filelog\"){
            action(type=\"omfwd\" protocol=\"tcp\" target=\"logs-01.loggly.com\" port=\"514\" template=\"$CONF_FILE_FORMAT_NAME\") stop
            }
        "
  fi

  if [ $FILE_TLS_SENDING == "false" ]; then
    imfileStr=$imfileStrNonTls
  fi

  #write to 21-<file-alias>.conf file
  sudo cat <<EOIPFW >>$FILE_SYSLOG_CONFFILE
$imfileStr
EOIPFW

}

#checks if the apache logs made to loggly
checkIfFileLogsMadeToLoggly() {
  counter=1
  maxCounter=10

  fileInitialLogCount=0
  fileLatestLogCount=0
  queryParam="syslog.appName%3A$LOGGLY_FILE_TO_MONITOR_ALIAS&from=-15m&until=now&size=1"

  queryUrl="$LOGGLY_ACCOUNT_URL/apiv2/search?q=$queryParam"
  logMsgToConfigSysLog "INFO" "INFO: Search URL: $queryUrl"

  logMsgToConfigSysLog "INFO" "INFO: Getting initial log count."
  #get the initial count of file logs for past 15 minutes
  searchAndFetch fileInitialLogCount "$queryUrl"

  logMsgToConfigSysLog "INFO" "INFO: Verifying if the logs made it to Loggly."
  logMsgToConfigSysLog "INFO" "INFO: Verification # $counter of total $maxCounter."
  #get the final count of file logs for past 15 minutes
  searchAndFetch fileLatestLogCount "$queryUrl"
  let counter=$counter+1

  while [ "$fileLatestLogCount" -le "$fileInitialLogCount" ]; do
    echo "INFO: Did not find the test log message in Loggly's search yet. Waiting for 30 secs."
    sleep 30
    echo "INFO: Done waiting. Verifying again."
    logMsgToConfigSysLog "INFO" "INFO: Verification # $counter of total $maxCounter."
    searchAndFetch fileLatestLogCount "$queryUrl"
    let counter=$counter+1
    if [ "$counter" -gt "$maxCounter" ]; then
      logMsgToConfigSysLog "ERROR" "ERROR: File logs did not make to Loggly in time. Please check network and firewall settings and retry."
      exit 1
    fi
  done

  if [ "$fileLatestLogCount" -gt "$fileInitialLogCount" ]; then
    logMsgToConfigSysLog "INFO" "INFO: Logs successfully transferred to Loggly! You are now sending $LOGGLY_FILE_TO_MONITOR logs to Loggly."
    checkIfLogsAreParsedInLoggly
  fi
}

#verifying if the logs are being parsed or not
checkIfLogsAreParsedInLoggly() {
  fileInitialLogCount=0
  TAG_PARSER=
  IFS=, read -a array <<<"$LOGGLY_FILE_TAG"
  for i in "${array[@]}"; do
    TAG_PARSER="$TAG_PARSER%20tag%3A$i "
  done

  queryParam="syslog.appName%3A$LOGGLY_FILE_TO_MONITOR_ALIAS$TAG_PARSER&from=-15m&until=now&size=1"
  queryUrl="$LOGGLY_ACCOUNT_URL/apiv2/search?q=$queryParam"
  searchAndFetch fileInitialLogCount "$queryUrl"
  if [ "$fileInitialLogCount" -gt 0 ]; then
    logMsgToConfigSysLog "INFO" "INFO: File logs successfully parsed in Loggly!"
  else
    logMsgToConfigSysLog "WARN" "WARN: We received your logs but they do not appear to use one of our automatically parsed formats. You can still do full text search and counts on these logs, but you won't be able to use our field explorer. Please consider switching to one of our automated formats https://www.loggly.com/docs/automated-parsing/"
  fi
}

#checks if the conf file exist. Name of conf file is constructed using the file alias name provided
checkIfConfFileExist() {
  if [[ ! -f "$FILE_SYSLOG_CONFFILE" ]]; then
    if [ $(sudo crontab -l 2>/dev/null | grep "file-monitoring-cron-$FILE_ALIAS.sh" | wc -l) -eq 1 ]; then
      logMsgToConfigSysLog "ERROR" "ERROR: Cron is running to refresh configuration. Please try again after sometime."
      exit 1
    else
      logMsgToConfigSysLog "ERROR" "ERROR: Invalid File Alias provided."
      exit 1
    fi
  fi
}

#remove 21<filemonitoring>.conf file
remove21ConfFile() {
  echo "INFO: Deleting the loggly syslog conf file $FILE_SYSLOG_CONFFILE."
  if [ -f "$FILE_SYSLOG_CONFFILE" ]; then
    sudo rm -rf "$FILE_SYSLOG_CONFFILE"
    deleteFileFromCrontab
    if [ "$IS_FILE_MONITOR_SCRIPT_INVOKED" = "false" ]; then
      echo "INFO: Removed all the modified files."
    fi
  else
    logMsgToConfigSysLog "WARN" "WARN: $FILE_SYSLOG_CONFFILE file was not found."
  fi
}

deleteFileFromCrontab() {
  if [ -f "/root/.loggly/file-monitoring-cron-$FILE_ALIAS.sh" ]; then

    logMsgToConfigSysLog "INFO" "INFO: Deleting sync Cron."

    #delete cron
    sudo crontab -l | grep -v "file-monitoring-cron-$FILE_ALIAS.sh" | crontab -

    #delete cron script
    sudo rm -f /root/.loggly/file-monitoring-cron-$FILE_ALIAS.sh

  fi

}

removeStatFile() {
  sudo rm -f $RSYSLOG_DIR/stat-*$FILE_ALIAS
}

#display usage syntax
usage() {
  cat <<EOF
usage: configure-file-monitoring [-a loggly auth account or subdomain] [-t loggly token (optional)] [-u username] [-p password (optional)] [-f filename] [-tag filetag1,filetag2 (optional)] [-l filealias] [-s suppress prompts {optional)]
usage: configure-file-monitoring [-a loggly auth account or subdomain] [-r to rollback] [-l filealias]
usage: configure-file-monitoring [-h for help]
EOF
}

##########  Get Inputs from User - Start  ##########
if [ "$1" != "being-invoked" ]; then
  if [ $# -eq 0 ]; then
    usage
    exit
  else
    while [ "$1" != "" ]; do
      case $1 in
      -t | --token)
        shift
        LOGGLY_AUTH_TOKEN=$1
        echo "AUTH TOKEN $LOGGLY_AUTH_TOKEN"
        ;;
      -a | --account)
        shift
        LOGGLY_ACCOUNT=$1
        echo "Loggly account or subdomain: $LOGGLY_ACCOUNT"
        ;;
      -u | --username)
        shift
        LOGGLY_USERNAME=$1
        echo "Username is set"
        ;;
      -p | --password)
        shift
        LOGGLY_PASSWORD=$1
        ;;
      -r | --rollback)
        LOGGLY_ROLLBACK="true"
        ;;
      -f | --filename)
        shift
        LOGGLY_FILE_TO_MONITOR="$(readlink -f ${1%/})"

        if [ -f "$LOGGLY_FILE_TO_MONITOR" ]; then

          LOGGLY_FILE_TO_MONITOR=$(readlink -f "$1")
          FILE_TO_MONITOR=$LOGGLY_FILE_TO_MONITOR
          echo "File to monitor: $LOGGLY_FILE_TO_MONITOR"

        elif [ -d "$LOGGLY_FILE_TO_MONITOR" ] || checkIfWildcardExist; then
          IS_DIRECTORY="true"
          echo "Directory to monitor: $LOGGLY_FILE_TO_MONITOR"

        else
          echo "ERROR: Cannot access $LOGGLY_FILE_TO_MONITOR: No such file or directory"
          exit 1
        fi
        ;;
      -l | --filealias)
        shift
        LOGGLY_FILE_TO_MONITOR_ALIAS=$1
        #keeping a copy of it as we need it in the loop
        FILE_ALIAS=$LOGGLY_FILE_TO_MONITOR_ALIAS
        STATE_FILE_ALIAS=$LOGGLY_FILE_TO_MONITOR_ALIAS
        CONF_FILE_FORMAT_NAME=$CONF_FILE_FORMAT_NAME$1
        echo "File alias: $LOGGLY_FILE_TO_MONITOR_ALIAS"
        ;;
      --insecure)
        LOGGLY_TLS_SENDING="false"
        FILE_TLS_SENDING="false"
        LOGGLY_SYSLOG_PORT=514
        ;;
      -tag | --filetag)
        shift
        LOGGLY_FILE_TAG=$1
        echo "File tag: $LOGGLY_FILE_TAG"
        ;;
      -s | --suppress)
        SUPPRESS_PROMPT="true"
        ;;
      -h | --help)
        usage
        exit
        ;;
      esac
      shift
    done
  fi

  if [ "$LOGGLY_ACCOUNT" != "" -a "$LOGGLY_USERNAME" != "" -a "$LOGGLY_FILE_TO_MONITOR" != "" -a "$LOGGLY_FILE_TO_MONITOR_ALIAS" != "" ]; then
    if [ "$LOGGLY_PASSWORD" = "" ]; then
      getPassword
    fi
    installLogglyConfForFile
  elif [ "$LOGGLY_ROLLBACK" != "" -a "$LOGGLY_ACCOUNT" != "" -a "$LOGGLY_FILE_TO_MONITOR_ALIAS" != "" ]; then
    removeLogglyConfForFile
  else
    usage
  fi
else
  IS_FILE_MONITOR_SCRIPT_INVOKED="true"
fi
##########  Get Inputs from User - End  ##########
