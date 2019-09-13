set -e

print_usage_and_exit () {
    echo 'Usage: ./restore-metadata.sh --country=bgd|zmb'
    echo "  --country must have a value of 'bgd' or 'zmb' set  as a supported alpha-3 country code e.g. --country=bgd"
    exit 1
}

if [ -z "$1" ] || { [ $1 != '--country=bgd' ] && [ $1 != '--country=zmb' ] ;} ; then
    echo 'Error: Argument --country is required in postition 1.'
    print_usage_and_exit
fi

DIR=$(cd "$(dirname "$0")"; pwd)
echo "Working dir: $DIR"