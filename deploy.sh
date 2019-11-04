set -ex
source env/bin/activate
python3 builder.py build
sudo rm -rf /var/www/alexrichey.com/*
sudo cp -r dist/* /var/www/alexrichey.com/
sudo systemctl restart nginx
