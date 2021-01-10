set -ex
yagss build
mkdir -p tmp
cd tmp
git clone git@github.com:AlexanderRichey/AlexanderRichey.github.io.git
cd AlexanderRichey.github.io
git co master
rm -rf *
cp -r ../../build/* .
git add .
git ci -m "Update site"
git push
cd ../../
rm -rf tmp
