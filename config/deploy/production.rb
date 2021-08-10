server '52.7.38.184', user:'app', roles: %w{app db web} 
set :ssh_options, keys:'/home/amina/.ssh/id_rsa'