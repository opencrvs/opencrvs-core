set -e
echo
echo "Tagging with short git hash - `git log -1 --pretty=%h`"
SHORT_GIT_HASH=$(git log -1 --pretty=%h)
sed -i '' -e "s/{{shortGitHash}}/$SHORT_GIT_HASH/g" $1 $2 $3
echo "DONE - $SHORT_GIT_HASH"
echo
