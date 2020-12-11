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
		const lastCharacterInSelection = activeTextEditor.document.lineAt(selection.active).range.end.character

		/** Expanded selection capturing the line's start and end position */
		const fullSelection = new vscode.Selection(
			new vscode.Position(selection.start.line, 0),
			new vscode.Position(selection.end.line, lastCharacterInSelection),
		)

		const text = activeTextEditor.document.getText(fullSelection)

		// TODO: Add check to ensure only one grid area is selected
		const validGridAreasRegex = /^\s*grid-template-areas:(.|\n)*?;\s*$/i

		if (!validGridAreasRegex.test(text)) return

		const regex = /"(.*)"/gi

		let gridAreas = []

		// Matching multiple capture groups: https://stackoverflow.com/a/26392494
		let match
		while (match = regex.exec(text)) {
			gridAreas.push(match[1])
		}

		const lines = gridAreas

		const normalizedLines = lines.map(
			line => line.trim().replace(/\s+/g, ' ').split(' ')
		)

		const largestWords: number[] = []

		normalizedLines.forEach(line => {
			line.forEach((word, i) => {
				if (!largestWords[i] || word.length > largestWords[i]) {
					largestWords[i] = word.length
				}
			})
		})

		const indentSpaces = ' '.repeat(text.indexOf('g'))

		const formattedLines = normalizedLines.map(
			line => line.map(
				(word, i, words) => (
					indentSpaces +
					(i === 0 ? '\t"' : '') + // Add indent and start quote on first word
					word.padEnd(largestWords[i], ' ') +
					(i === words.length - 1 ? '"' : '') // Add ending quote on last word
				)
			).join(' ')
		)

		const newSelection = indentSpaces + 'grid-template-areas:\n' + formattedLines.join('\n') + ';'

		activeTextEditor.edit(editBuilder => {
			editBuilder.replace(fullSelection, newSelection)
		})
	})

	context.subscriptions.push(disposable)
}

// this method is called when your extension is deactivated
export function deactivate() {}
