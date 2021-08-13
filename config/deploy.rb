# config valid only for current version of Capistrano
lock '3.6.0'
# Application name to deploy
set :application, 'AWSAPP'
# git repository to clone
# (Xxxxxxxx: user name, yyyyyyyy: application name)
set :repo_url, 'https://github.com/Uzayisenga/AWSAPP.git'
# deployするブランチ。デフォルトでmainを使用している場合、masterをmainに変更してください。
set :branch, ENV['BRANCH'] || 'master'
# The directory to deploy to.
set :deploy_to, '/var/www/AWSAPP'
# Folders/files with symbolic links
set :linked_files, %w{.env config/secrets.yml}
set :linked_dirs, %w{log tmp/pids tmp/cache tmp/sockets public/uploads}
# Number of versions to retain (*described later)
set :keep_releases, 5
after "deploy:restart", "deploy:cleanup"
# Ruby version
set :rbenv_ruby, '2.7.4'

set :rbenv_type, :system
set :branch, 'capistrano'
set :branch, "master"
# The level of the log to output. Settings to: debug if you want to see the error log in detail.
# For production environments,: info is normal。
# However, if you want to check the behavior firmly, Settings it to: debug.
set :log_level, :info
namespace :deploy do
  desc 'Restart application'
  task :restart do
    invoke 'unicorn:restart'
  end
  desc 'Create database'
  task :db_create do
    on roles(:db) do |host|
      with rails_env: fetch(:rails_env) do
        within current_path do
          execute :bundle, :exec, :rake, 'db:create'
        end
      end
    end
  end
  desc 'Run seed'
  task :seed do
    on roles(:app) do
      with rails_env: fetch(:rails_env) do
        within current_path do
          execute :bundle, :exec, :rake, 'db:seed'
        end
      end
    end
  end
  after :publishing, :restart
  after :restart, :clear_cache do
    on roles(:web), in: :groups, limit: 3, wait: 10 do
    end
  end
end
set :default_env, {
    PATH: '$HOME/.nvm/versions/node/v14.17.4/bin/:$PATH',
    NODE_ENVIRONMENT: 'production'
}
