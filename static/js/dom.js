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
							<div class="board-header"><div class="board-title" data-board-id="${board.id}"><span>${board.title}</span></div>
								<button class="board-add" data-board-id="${board.id}" data-status-id="${board.columns[0].id}">Add Card</button>
								<button class="board-delete" data-board-id="${board.id}"><i class="fas fa-trash-alt"></i></button>
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

		// Add board button
		document.querySelector('#add-board-button').addEventListener('click', dom.createBoard);

		// Add card buttons
		document.querySelectorAll('.board-add').forEach(button => button.addEventListener('click', function() {
			dom.createCard(parseInt(this.dataset.boardId), parseInt(this.dataset.statusId))
		}));

		// Board toggle buttons
		dom.setBoardToggleButtons();

		// Edit title function
		dom.addBoardDeleteFunction();
		dom.addBoardTitleEditFunction();
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
					<div class="card" data-card-id="${card.id}" data-board-id="${card.board_id}" data-card-order="${card.order}">
						<div class="card-remove"><i class="fas fa-trash-alt"></i></div>
						<div class="card-title"><span>${card.title}</span></div>
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
			<div style="text-align: right;width: auto; padding: 5px 15px 15px 5px">
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

		// Rename cards
		document.querySelectorAll('.card').forEach(card => dom.setRenameCard(card, board.id));

		// Toggle button
		let button = Array.from(document.querySelectorAll('.board-toggle')).find(button => parseInt(button.dataset.boardId) === board.id);
		button.children[0].className = button.children[0].className.replace('down', 'up');

		// Delete card button
		document.querySelectorAll('.card-remove').forEach(card => {
			card.children[0].addEventListener('click', function() {
				dom.deleteCard(card.parentNode)
			});
		});

		// Dragula
		dom.cardDragAndDrop(`#board${board.id}`).on('drop', function(card, targetColumn) {
			let cardId = card.dataset.cardId;
			let order = Array.from(targetColumn.children).map(card => card.dataset.cardId);
			let newStatus = targetColumn.parentNode.dataset.columnId;
			dataHandler.changeCardOrder(cardId, order, newStatus, function() {});
		});

		dom.columnDragAndDrop(board.id).on('drop', function (column, targetDiv) {
			let order = Array.from(targetDiv.children).map(column => column.dataset.columnId);
			dataHandler.changeColumnOrder(board.id, order, function() {

			});
		});
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
			let newBoard = `
				<section class="board" id="board${board.id}">
					<div class="board-header"><div class="board-title" data-board-id="${board.id}"><span>${board.title}</span></div>
						<button class="board-add" data-board-id="${board.id}" data-status-id="${board.columns[0].id}">Add Card</button>
						<button class="board-delete" data-board-id="${board.id}"><i class="fas fa-trash-alt"></i></button>
						<button class="board-toggle" data-board-id="${board.id}"><i class="fas fa-chevron-down"></i></button>
					</div>
				</section>
			`;
			dom._appendToElement(document.querySelector('#boards'), newBoard);

			Array.from(document.querySelectorAll('.board-add')).find(button => parseInt(button.dataset.boardId) === board.id).addEventListener('click', function () {
				dom.createCard(parseInt(this.dataset.boardId), parseInt(this.dataset.statusId))
			});

			Array.from(document.querySelectorAll('.board-toggle')).find(button => parseInt(button.dataset.boardId) === board.id).addEventListener('click', function () {
				dom.toggleBoard(parseInt(this.dataset.boardId));
			});

			let titleDiv = Array.from(document.querySelectorAll('.board-title')).find(titleDiv => parseInt(titleDiv.dataset.boardId) === board.id);
			titleDiv.children[0].addEventListener('click', function () {
				dom.renameBoard(titleDiv);
			});

			Array.from(document.querySelectorAll('.board-delete')).find(button => parseInt(button.dataset.boardId) === board.id).addEventListener('click', function () {
				dom.deleteBoard(this.dataset.boardId);
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
			<input type="text" value="${title}" placeholder="${title}" required>
		`;
		columnTitleDiv.children[0].focus();
		['blur', 'change'].forEach(event => {
			columnTitleDiv.children[0].addEventListener(event, function () {
				dataHandler.renameColumn(columnId, boardId, columnTitleDiv.children[0].value, function () {
					dom.loadBoard(boardId)
				});
			});
		});
	},
	addBoardTitleEditFunction: function () {
		let boardTitles = document.querySelectorAll('.board-title');
		boardTitles.forEach(function (titleDiv) {
			titleDiv.children[0].addEventListener('click', function () {
				dom.renameBoard(titleDiv)
			});
		});
	},
	renameBoard: function (titleDiv) {
		titleDiv.innerHTML = `
			<input type="text" value="${titleDiv.children[0].innerHTML}" placeholder="${titleDiv.children[0].innerHTML}" data-board-id="${titleDiv.dataset.boardId}" required>
		`;
		titleDiv.children[0].focus();
		['blur', 'change'].forEach(event => {
			titleDiv.children[0].addEventListener(event, function () {
				let newTitle = this.value;
				dataHandler.editBoardTitle(titleDiv.dataset.boardId, newTitle, function () {
					titleDiv.innerHTML = `<span>${newTitle}</span>`;
					titleDiv.children[0].addEventListener('click', function () {
						dom.renameBoard(titleDiv);
					});
				});
			});
		});
	},
	setRenameCard: function (card, boardId) {
		card.children[1].children[0].addEventListener('click', function () {
			let cardId = card.dataset.cardId;
			card.children[1].innerHTML = `
				<input type="text" value="${this.innerHTML}" data-card-id="${cardId}" required>
			`;
			card.children[1].children[0].focus();
			['blur', 'change'].forEach(event => {
				card.children[1].children[0].addEventListener(event, function () {
					dataHandler.renameCard(cardId, this.value, function(){dom.loadBoard(boardId)});
				});
			});
		});
	},
	addBoardDeleteFunction: function () {
		let boardDeleteButtons = document.querySelectorAll('.board-delete');
		boardDeleteButtons.forEach(function (button) {
			button.addEventListener('click', function () {
				let boardId = this.dataset.boardId;
				dom.deleteBoard(boardId)
			})
		})
	},
	deleteBoard: function (boardId) {
		dataHandler.deleteBoard(boardId, function () {
			document.querySelector(`#board${boardId}`).remove();
		})
	},
	deleteCard: function (card) {
		dataHandler.deleteCard(card.dataset.cardId, function () {
			dom.loadBoard(card.dataset.boardId)
		});
	},
	cardDragAndDrop: function (board_id) {
		let cols = document.querySelectorAll(`${board_id} .board-column-content`);
		let container = [];

		for (let elem of cols){
			container.push(elem);

		}
		return dragula(container);
	},
	columnDragAndDrop: function (boardId) {
		return dragula(Array.from(document.querySelectorAll('.board-columns')).filter(column => parseInt(column.dataset.boardId) === boardId), {
			moves: function (el, container, handle) {
				return handle.classList.contains('board-column-title');
			}
		});
	}
};