[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/piotrgredowski.poor-mans-t-sql-formatter-pg?style=plastic)](https://marketplace.visualstudio.com/items?itemName=piotrgredowski.poor-mans-t-sql-formatter-pg)
[![Visual Studio Marketplace Installs](https://img.shields.io/visual-studio-marketplace/i/piotrgredowski.poor-mans-t-sql-formatter-pg?style=plastic)](https://marketplace.visualstudio.com/items?itemName=piotrgredowski.poor-mans-t-sql-formatter-pg)
[![Visual Studio Marketplace Rating](https://img.shields.io/visual-studio-marketplace/r/piotrgredowski.poor-mans-t-sql-formatter-pg?style=plastic)](https://marketplace.visualstudio.com/items?itemName=piotrgredowski.poor-mans-t-sql-formatter-pg)

# Poor Man's T-SQL Formatter - VS Code Extension (PG)

One of not too many, open source T-SQL formatters as an extension for VSCode.

## **IMPORTANT NOTE**

This extension is only to make it possible to use [Poor Man's T-SQL Formatter](https://github.com/TaoK/PoorMansTSqlFormatter) in VSCode.
I am not going to modify source code and behavior of [Poor Man's T-SQL Formatter](https://github.com/TaoK/PoorMansTSqlFormatter) anyhow. Idea behind this extension is to make
this great SQL formatter working with the current versions of VSCode and Azure Data Studio.

If you'd have any problems with running this extension in any VSCode version - please raise an issue.

But if you'd like to change how code is formatted and playing with provided extension's config options doesn't work - I won't be able to help with that.

Cheers! ;)

## History

This repository is (at least for now) heavily inspired by [Poor Man's T-SQL Formatter - VS Code Extension](https://github.com/TaoK/poor-mans-t-sql-formatter-vscode-extension)
authored by [Tao Klerks](https://github.com/TaoK). Also some parts of code are exactly the same as ones in mentioned repository.

Decision to create new VSCode Extension was driven by fact that original extension was not maintained for last 3 years.
Also current version of mentioned extension is not working with modern versions of VSCode.

#### If it helps you

If you like this extension and it helps you - consider giving:

- :star: a star on [github](https://github.com/piotrgredowski/poor-mans-t-sql-formatter-vscode-extension)
- :pencil: a review in [VSCode marketplace](https://marketplace.visualstudio.com/items?itemName=piotrgredowski.poor-mans-t-sql-formatter-pg&ssr=false#review-details)

## Marketplace

Extension can be found [here](https://marketplace.visualstudio.com/items?itemName=piotrgredowski.poor-mans-t-sql-formatter-pg).

## TODO:

- [x] Clean up code.
- [ ] Add tests to check if extension works for three latest minor versions of VSCode.
- [ ] Provide better README.
- [ ] Add support for taking configuration options from JSON/yaml file.
- [ ] Provide `pre-commit` task. Here or in another repository.
