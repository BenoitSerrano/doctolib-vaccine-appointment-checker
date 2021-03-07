# Doctolib vaccine appointment checker

This script checks every 10 minutes whether new appointments for COVID vaccination have been released. Whenever it occurs, a SMS is sent to the set phone number.

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

## Credits

The concept and the algorithm are directly inspired from the @AntoineAugusti Python script [here](https://github.com/AntoineAugusti/doctolib-vaccins)
