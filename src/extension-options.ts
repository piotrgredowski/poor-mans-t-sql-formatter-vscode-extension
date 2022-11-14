enum FormattingType {
  standard = "standard",
  obfuscation = "obfuscation",
}

export interface ExtensionOptions {
  confirmOnError: boolean;
  expectedLanguages: string[];
  dontWarnOnLanguageMismatch: boolean;
  errorOutputPrefix: string;
  dontInsertErrorOutput: boolean;
  formattingType: FormattingType;
  indent: string;
  spacesPerTab: number;
  maxLineWidth: number;
  statementBreaks: number;
  clauseBreaks: number;
  expandCommaLists: boolean;
  trailingCommas: boolean;
  spaceAfterExpandedComma: boolean;
  expandBooleanExpressions: boolean;
  expandCaseStatements: boolean;
  expandBetweenConditions: boolean;
  expandInLists: boolean;
  breakJoinOnSections: boolean;
  uppercaseKeywords: boolean;
  keywordStandardization: boolean;
  randomizeKeywordCase: boolean;
  randomizeLineLengths: boolean;
  preserveComments: boolean;
  enableKeywordSubstitution: boolean;
}
