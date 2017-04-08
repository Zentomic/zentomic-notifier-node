git add .

git commit -m %1

heroku login


heroku git:remote -a zentomic-notifier-node

git push heroku master
