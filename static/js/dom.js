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

		let boardsElement = document.querySelector('#boards');
		boardsElement.innerHTML = '';

		let boardList = '';

		for (let board of boards){
			boardList += `
							<section class="board" id="board${board.id}">
							<div class="board-header"><span class="board-title">${board.title}</span>
								<button class="board-add" data-board-id="${board.id}" data-status-id="${board.columns[0].id}">Add Card</button>
								<button class="board-toggle" data-board-id="${board.id}"><i class="fas fa-chevron-down"></i></button>
							</div>
							</section>
            `;
		}

		const outerHtml = `
							<button id="add-board-button">Add board</button>
							${boardList}
        `;

		this._appendToElement(boardsElement, outerHtml);

		document.querySelector('#add-board-button').addEventListener('click', dom.createBoard);
		document.querySelectorAll('.board-add').forEach(button => button.addEventListener('click', function() {
			dom.createCard(parseInt(this.dataset.boardId), parseInt(this.dataset.statusId))
		}));
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

		let boardColumns = Array.from(document.querySelectorAll('.board-columns')).find(column => parseInt(column.dataset.boardId) === board.id);
		if (boardColumns) {
			boardColumns.remove();
		}

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
					<div class="board-column-title" data-column-id="${column.id}" data-board-id="${board.id}"><span>${column.title}</span></div>
					<div class="board-column-content">
						${cardList}
					</div>
				</div>
			`
		}

		let addColumnButton = `
			<div style="text-align: right;width: 20px" class="board-column">
				<button class="board-column-add" data-board-id="${board.id}">+</button>
			</div>
		`;

		const outerHtml = `
			<div class="board-columns" data-board-id="${board.id}">
				${columnList}
				${addColumnButton}
			</div>
		`;

		this._appendToElement(document.querySelector(`#board${board.id}`), outerHtml);

		// Add columns button
		Array.from(document.querySelectorAll('.board-column-add')).find(button => parseInt(button.dataset.boardId) === board.id).addEventListener('click', function() {
			dom.createColumn(board.id)
		});

		// Rename columns
		document.querySelectorAll('.board-column-title').forEach(title => title.firstChild.addEventListener('click', function () {
			dom.renameColumn(title);
		}));

		// Toggle button
		let button = Array.from(document.querySelectorAll('.board-toggle')).find(button => parseInt(button.dataset.boardId) === board.id);
		button.children[0].className = button.children[0].className.replace('down', 'up');

	},
	// here comes more features

	hideBoard: function (boardId) {
		let boards = Array.from(document.querySelectorAll('.board-columns'));
		let boardToHide = boards.find(board => parseInt(board.dataset.boardId) === boardId);
		boardToHide.remove();

		let button = Array.from(document.querySelectorAll('.board-toggle')).find(button => parseInt(button.dataset.boardId) === boardId);
		button.children[0].className = button.children[0].className.replace('up', 'down');
	},
	setBoardToggleButtons: function () {
		document.querySelectorAll('.board-toggle').forEach(button => button.addEventListener('click', function() {
			dom.toggleBoard(parseInt(this.dataset.boardId));
		}));
	},
	toggleBoard: function (boardId) {
		let board = document.querySelector(`#board${boardId}`);
		let opened = board.children.length > 1;
		if (opened) {
			dom.hideBoard(boardId);
		} else {
			dom.loadBoard(boardId);
		}
	},
	createBoard: function () {
		dataHandler.createNewBoard(function (board) {
			// dom.loadBoards();
			let newBoard = `
				<section class="board" id="board${board.id}">
				<div class="board-header"><span class="board-title">${board.title}</span>
					<button class="board-add" data-board-id="${board.id}" data-status-id="${board.columns[0].id}">Add Card</button>
					<button class="board-toggle" data-board-id="${board.id}"><i class="fas fa-chevron-down"></i></button>
				</div>
				</section>
			`;
			dom._appendToElement(document.querySelector('#boards'), newBoard);

			Array.from(document.querySelectorAll('.board-add')).find(button => parseInt(button.dataset.boardId) === board.id).addEventListener('click', function() {
				dom.createCard(parseInt(this.dataset.boardId), parseInt(this.dataset.statusId))
			});

			Array.from(document.querySelectorAll('.board-toggle')).find(button => parseInt(button.dataset.boardId) === board.id).addEventListener('click', function() {
				dom.toggleBoard(parseInt(this.dataset.boardId));
			});
		});
	},
	createCard: function (boardId, statusId) {
		dataHandler.createNewCard(boardId, statusId, function () {
			dom.loadBoard(boardId);
		});
	},
	createColumn: function (boardId, title='New Column') {
		dataHandler.createNewColumn(boardId, title, function () {
			dom.loadBoard(boardId);
		})
	},
	renameColumn: function (columnTitleDiv) {
		let columnId = parseInt(columnTitleDiv.dataset.columnId);
		let boardId = parseInt(columnTitleDiv.dataset.boardId);
		let title = columnTitleDiv.firstChild.innerHTML;
		columnTitleDiv.innerHTML = `
			<input type="text" value="${title}" placeholder="${title}" required autofocus>
			<button class="rename-btn-save">Save</button>
		`;
		let saveBtn = columnTitleDiv.children[1];
		saveBtn.addEventListener('click', function () {
			dataHandler.renameColumn(columnId, boardId, columnTitleDiv.children[0].value, function () {
				dom.loadBoard(boardId)
			});
		});
	}
};
