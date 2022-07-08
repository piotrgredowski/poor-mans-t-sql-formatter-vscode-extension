import * as vscode from "vscode";

export function askForStar(context: vscode.ExtensionContext) {
  const askForStarKey = "didAskForStart";
  const didAlreadyAsk = !!context.globalState.get(askForStarKey);

  if (didAlreadyAsk) {
    return;
  }

  const superAnswer = "Ok";
  const closeAnswer = "Close";
  vscode.window
    .showInformationMessage(
      `If you like this extension and it helps you - consider giving it a star on ` +
        `[Github](https://github.com/piotrgredowski/poor-mans-t-sql-formatter-vscode-extension) or writing a review in ` +
        `[VSCode marketplace](https://marketplace.visualstudio.com/items?itemName=piotrgredowski.poor-mans-t-sql-formatter-pg&ssr=false#review-details) to make maintainer motivated!`,
      { modal: false },
      ...[superAnswer, closeAnswer]
    )
    .then((answer) => {
      context.globalState.update(askForStarKey, false);

      if (answer === superAnswer) {
        vscode.window.showInformationMessage("Thank you!", closeAnswer);
      }
    });
}
