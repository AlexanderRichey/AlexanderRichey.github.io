source env/bin/activate
python3 builder.py build
mkdir -p tmp
cd tmp
git clone git@github.com:AlexanderRichey/AlexanderRichey.github.io.git
rm -rf *
cp ../dist/* .
git add .
git ci -m "Update site"
git push
cd ..
rm -rf tmp
