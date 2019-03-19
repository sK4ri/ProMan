// It uses data_handler.js to visualize elements
import { dataHandler } from "./data_handler.js";

export let dom = {
	_appendToElement: function (elementToExtend, textToAppend, prepend = false) {
		// function to append new DOM elements (represented by a string) to an existing DOM element
		let fakeDiv = document.createElement('div');
		fakeDiv.innerHTML = textToAppend.trim();

		for (let childNode of fakeDiv.childNodes) {
			if (prepend) {
				elementToExtend.prependChild(childNode);
			} else {
				elementToExtend.appendChild(childNode);
			}
		}

		return elementToExtend.lastChild;
	},
	init: function () {
		// This function should run once, when the page is loaded.
	},
	loadBoards: function () {
		// retrieves boards and makes showBoards called
		dataHandler.getBoards(function(boards){
			dom.showBoards(boards);
		});
	},
	showBoards: function (boards) {
		// shows boards appending them to #boards div
		// it adds necessary event listeners also

		let boardList = '';

		for(let board of boards){
			boardList += `
							<section class="board" id="board${board.id}">
							<div class="board-header"><span class="board-title">${board.title}</span>
								<button id="add-card-button" class="board-add" data-board-id="board.id">Add Card</button>
								<button class="board-toggle" data-board-id="${board.id}"><i class="fas fa-chevron-down"></i></button>
							</div>
							</section>
            `;
		}

		const outerHtml = `
							<button id="add-board-button">Add board</button>
							${boardList}
        `;

		this._appendToElement(document.querySelector('#boards'), outerHtml);

		dom.setBoardToggleButtons()
	},
	loadBoard: function (boardId) {
		// retrieves cards and makes showCards called
		dataHandler.getBoardById(boardId, function(board){
			dom.showBoard(board);
		});
	},
	showBoard: function (board) {
		// shows the cards of a board
		// it adds necessary event listeners also
		//TODO dragula event listeners


		let columnList = '';
		for (let column of board.columns) {
			let cardList = '';
			for (let card of column.cards) {
				cardList += `
					<div class="card" data-card-id="${card.id}">
						<div class="card-remove"><i class="fas fa-trash-alt"></i></div>
						<div class="card-title">${card.title}</div>
					</div>
				`
			}
			columnList += `
				<div class="board-column" data-column-id="${column.id}">
					<div class="board-column-title">${column.title}</div>
					<div class="board-column-content">
						${cardList}
					</div>
				</div>
			`
		}

		const outerHtml = `
			<div class="board-columns" data-board-id="${board.id}">
				${columnList}
			</div>
		`;

		this._appendToElement(document.querySelector(`#board${board.id}`), outerHtml);
	},
	// here comes more features

	hideBoard: function(boardId) {
		let boards = Array.from(document.querySelectorAll('.board-columns'));
		let boardToHide = boards.find(board => board.dataset.boardId === boardId);
		boardToHide.remove();
	},
	setBoardToggleButtons: function() {
		let buttons = document.querySelectorAll('.board-toggle');
		for (let button of buttons) {
			button.addEventListener('click', function() {
				dom.toggleBoard(this);
			});
		}
	},
	toggleBoard: function(button) {
		let boardId = button.dataset.boardId;
		let symbol = button.childNodes[0];
		if (symbol.classList.contains('fa-chevron-down')) {
			dom.loadBoard(boardId);
			symbol.className = symbol.className.replace('down', 'up');
		} else {
			dom.hideBoard(boardId);
			symbol.className = symbol.className.replace('up', 'down');
		}
	},
};
