set -e
echo
echo "Tagging with short git hash - `git log -1 --pretty=%h`"
SHORT_GIT_HASH=$(git log -1 --pretty=%h)
sed -i '' -e "s/$SHORT_GIT_HASH/{{shortGitHash}}/g" $1 $2 $3
echo "DONE"
echo
