// `grid-template-areas` specification reference:
// https://drafts.csswg.org/css-grid/#propdef-grid-template-areas

import * as vscode from 'vscode'

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('format-grid-areas.formatGridAreas', () => {
		const { activeTextEditor } = vscode.window
	
		if (!activeTextEditor) {
			return vscode.window.showErrorMessage('No active text editor in focus.')
		}

		const selection = activeTextEditor.selection

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
		//                             P1         P2           P3            P4             P5 P6P7
		const validGridAreasRegex = /^[ ]*grid-template-areas:\s*?['|"](.|\r|\n|\r\n)*['|"]\s*?;[ ]*$/i

		if (!validGridAreasRegex.test(text)) {
			return vscode.window.showErrorMessage(
				'The selection did not contain a valid `grid-template-areas` declaration or extended the bounds of the declaration',
			)
		}

		const gridAreaRowsRegex = /(['|"])(.*?)['|"]/gi

		/**
		 * Preferred quote to apply while formatting (e.g. single or double quote).
		 *
		 * Note: This is determined by the first quote found in the `grid-template-areas` declaration.
		 */
		let q
		let gridAreaRows: string[] = []

		let match
		while (match = gridAreaRowsRegex.exec(text)) {
			if (!q) { q = match[1] }
			gridAreaRows.push(match[2])
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

		/** Used to maintain the initial selection indentation when building the final result */
		const indentSpaces = ' '.repeat(text.indexOf('g'))

		const formattedGridAreaRows: string[] = []

		for (let y = 0; y < normalizedGridAreas.length; y++) {
			formattedGridAreaRows[y] = ''

			for (let x = 0; x < longestRowLength; x++) {
				// Add null cell token if current column value is empty
				const token = normalizedGridAreas[y][x] || '.'

				formattedGridAreaRows[y] += (
					// Add an indent and start quote to the first token
					// otherwise add a space to separate each column
					(x === 0 ? indentSpaces + `\t${q}` : ' ') +

					// Add end padding based on the longest token in the current column
					token.padEnd(longestTokens[x], ' ') +

					// Add ending quote to the last token
					(x === longestRowLength - 1 ? q : '')
				)
			}
		}

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
