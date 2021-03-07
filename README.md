# Doctolib vaccine appointment checker

This script regularly checks whether new appointments for COVID vaccination have been released. Whenever it occurs, an email is sent to the set email address.

## How to run

### Locally

- Fork the repository

- Copy the `.env.example` to a `.env` file and fill in the right values

- `yarn`
- `yarn startLocal`

### Via Github Actions

- Fork the repository

- Go to Settings > Environments > New environment

- Create a `staging` environment. If you want to choose another name for your environment, you will have to change the jobs > build > environment value in `cron.yml`

- Go to Settings > Environments > staging > Environment secrets

- For every value in `env.example`, add the corresponding secret variable in the `staging` environment
