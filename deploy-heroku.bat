git add .

git commit -m "deploy heroku zentomic notifier node better"

heroku login


heroku git:remote -a zentomic-notifier-node

git push heroku master
