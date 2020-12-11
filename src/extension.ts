// `grid-template-areas` specification reference:
// https://drafts.csswg.org/css-grid/#propdef-grid-template-areas

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('format-grid-areas.formatGridAreas', () => {
		// The code you place here will be executed every time your command is executed
		const { activeTextEditor } = vscode.window
	
		if (!activeTextEditor) {
			throw vscode.window.showErrorMessage('No active text editor in focus.')
		}

		// https://github.com/microsoft/vscode-extension-samples/blob/master/document-editing-sample/src/extension.ts#L8-L20
		const selection = activeTextEditor.selection
		// const text = activeTextEditor.document.getText(selection)

		// https://stackoverflow.com/a/64562296
		/** Zero-based index of the last character in the selection */
		const lastCharacterInSelection =
			activeTextEditor.document.lineAt(selection.active).range.end.character

		/** Expanded selection capturing the (multi)line's start and end position */
		const fullSelection = new vscode.Selection(
			new vscode.Position(selection.start.line, 0),
			new vscode.Position(selection.end.line, lastCharacterInSelection),
		)

		const text = activeTextEditor.document.getText(fullSelection)

		// Validation Reference:
		// P1 - Starting with any number of spaces until the grid area property
		// P2 - CSS grid-template-areas property including the colon
		// P3 - Any number of spaces or newlines until the starting quote (e.g. starting grid area row)(lazy)
		// P4 - Any grid area tokens until the ending quote (e.g. ending grid area row)(greedy)
		// P5 - Any number of spaces or newlines until the ending semi-colon (lazy)
		// P6 - Ending declaration semi-colon
		// P7 - Any number of spaces to the end of the selection
		//                            P1          P2             P3       P4     P5    P6P7
		const validGridAreasRegex = /^[ ]*grid-template-areas:(.|\n)*?"(.|\n)*"(.|\n)*?;[ ]*$/i

		if (!validGridAreasRegex.test(text)) {
			throw vscode.window.showErrorMessage(
				'The selection did not contain a valid `grid-template-areas` declaration or extended the bounds of the declaration',
			)
		}

		const gridAreaRowsRegex = /"(.*?)"/gi

		let gridAreaRows: string[] = []

		// Matching multiple capture groups: https://stackoverflow.com/a/26392494
		let match
		while (match = gridAreaRowsRegex.exec(text)) {
			gridAreaRows.push(match[1])
		}

		const normalizedGridAreas = gridAreaRows.map(row => row.trim().split(/\s+/))

		/** Longest row length is used to fill empty cells in the grid */
		let longestRowLength = 0

		/** List of the longest named cell token in each column */
		const longestTokens: number[] = []

		normalizedGridAreas.forEach(row => {
			const currentRowLength = row.length

			if (currentRowLength > longestRowLength) {
				longestRowLength = currentRowLength
			}

			row.forEach((token, i) => {
				if (!longestTokens[i] || token.length > longestTokens[i]) {
					longestTokens[i] = token.length
				}
			})
		})

		const filledGridAreas: string[][] = []

		/** Fill empty cells will null cell tokens (e.g. ".") */
		for (let i = 0; i < normalizedGridAreas.length; i++) {
			filledGridAreas[i] = []

			for (let j = 0; j < longestRowLength; j++) {
				filledGridAreas[i][j] = normalizedGridAreas[i][j] || '.'
			}
		}

		/** Used to maintain the initial selection indentation when building the final result */
		const indentSpaces = ' '.repeat(text.indexOf('g'))

		const formattedGridAreaRows = filledGridAreas.map(
			row => row.map(
				(token, i, tokens) => (
					// Add indent and start quote on first token
					(i === 0 ? indentSpaces + '\t"' : '') +
					// Add end padding based on the longest token in the current column
					token.padEnd(longestTokens[i], ' ') +
					// Add ending quote on last token
					(i === tokens.length - 1 ? '"' : '')
				)
			).join(' ')
		)

		const newSelection = (
			indentSpaces +
			'grid-template-areas:\n' +
			formattedGridAreaRows.join('\n') +
			';'
		)

		activeTextEditor.edit(editBuilder => {
			editBuilder.replace(fullSelection, newSelection)
		})
	})

	context.subscriptions.push(disposable)
}

// this method is called when your extension is deactivated
export function deactivate() {}
