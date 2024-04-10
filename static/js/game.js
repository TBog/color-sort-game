function updateInterface(gameDiv, ColorGame) {
	let bottles = ColorGame.bottles;
	for (let bottleIdx = 0, bottleNum = bottles.length; bottleIdx < bottleNum; ++bottleIdx) {
		let bottle = bottles[bottleIdx];
		let table = gameDiv.querySelector("[id='" + bottle.id + "']");
		
		{
			let bottleForm = table.closest("form");
			let btn = bottleForm.querySelector('button');
			if (ColorGame.isBottlePicked(bottle.id)) {
				btn.textContent = '[^]';
				bottleForm.closest('div').classList.add("picked");
			} else {
				btn.innerHTML = '[&nbsp;]';
				bottleForm.closest('div').classList.remove("picked");
			}
		}
		
		for (let rowIdx = 0, rowNum = table.rows.length; rowIdx < rowNum; ++rowIdx) {
			let row = table.rows[rowIdx];
			if (row.cells.length <= 0)
				continue;
			let cell = row.cells[0];
			if (cell.childElementCount != 2)
				continue;
			let childStyle = cell.getElementsByTagName("span")[0].style;
			let input = cell.getElementsByTagName("input")[0];
			input.value = bottle.colors[rowIdx];
			if (isEmpty(input.value) || input.value == "_") {
				input.value = "_";
				childStyle.removeProperty("color");
				childStyle.removeProperty("background-color");
			}
			else {
				childStyle.color = childStyle.backgroundColor = input.value;
			}
		}
	}
}

function getBottles(gameDiv) {
	let bottles = [];
	let tables = gameDiv.getElementsByTagName("table");
	//console.log("tables=", tables);
	for (let tableIdx = 0, tableNum = tables.length; tableIdx < tableNum; ++tableIdx) {
		let table = tables[tableIdx];
		if (isEmpty(table.id)) {
			table.id = "bottle_" + tableIdx;
			let bottleForm = table.closest("form");
			const bottleTitleSpan = document.createElement('span');
			bottleTitleSpan.appendChild(document.createTextNode('#' + tableIdx));
			bottleForm.closest('div').insertAdjacentElement('afterbegin', bottleTitleSpan);
			let hiddenInput = bottleForm.querySelector('input[name="bottle"]');
			if (hiddenInput) {
				hiddenInput.value = table.id;
			}
		}
		let bottle = getBottle(table);
		bottles.push(bottle);
	}
	return bottles;
}

function getBottle(table) {
	let bottle = {};
	bottle.id = table.id;
	bottle.colors = [];
	for (let rowIdx = 0, rowNum = table.rows.length; rowIdx < rowNum; ++rowIdx) {
		let row = table.rows[rowIdx];
		if (row.cells.length <= 0)
			continue;
		let cell = row.cells[0];
		if (cell.childElementCount != 2)
			continue;
		let childStyle = cell.getElementsByTagName("span")[0].style;
		let input = cell.getElementsByTagName("input")[0];
		if (isEmpty(input.value) || input.value == "_") {
			input.value = "_";
			childStyle.removeProperty("color");
			childStyle.removeProperty("background-color");
		}
		else {
			childStyle.color = childStyle.backgroundColor = input.value;
		}
		bottle.colors[rowIdx] = input.value;
	}
	return bottle;
}

function bottleSelect(btn, ColorGame) {
	let bottleForm = btn.closest("form");
	let bottleId = bottleForm.querySelector('input[name="bottle"]').value;
	
	// if there is a picked bottle
	if (ColorGame.canPour()) {
		// if bottle is valid (not full, color matching, etc.)
		if (ColorGame.canPourInBottle(bottleId)) {
			ColorGame.pourInBottle(bottleId);
			console.log(ColorGame.hashCode());
			ColorGame.pickBottle(null);
		} else if (ColorGame.isBottlePicked(bottleId)) {
			ColorGame.pickBottle(null);
		} else {
			ColorGame.pickBottle(bottleId);
		}
	} else {
		ColorGame.pickBottle(bottleId);
	}
	
	updateInterface($('game'), ColorGame);
}
