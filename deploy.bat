git add .

git commit -m %1

git remote add origin https://github.com/Zentomic/zentomic-notifier-node.git

git remote -v

git push origin master --force


heroku login

heroku git:remote -a zentomic-notifier-node

git push heroku master
