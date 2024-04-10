const EMPTY_COLOR = '_'; // must not be a number
export class Bottle {
	constructor(name) {
		this.id = name;
		this.mColors = [];
	}
	
	get colors() {
		return this.mColors;
	}
	
	set colors(value) {
		let colors = [];
		for (let idx = 0, num = value.length; idx < num; ++idx) {
			let color = value[idx];
			colors[idx] = typeof color == 'number' ? color : EMPTY_COLOR;
		}
		this.mColors = colors;
		this.normalize();
	}
	
	normalize() {
		let idx = 1;
		let num = this.mColors.length;
		while (idx < num) {
			let color = this.mColors[idx];
			let colorAbove = this.mColors[idx - 1];
			if (color == EMPTY_COLOR && colorAbove != EMPTY_COLOR) {
				this.mColors[idx] = colorAbove;
				this.mColors[idx - 1] = color;
				if (idx > 1) {
					--idx;
					continue;
				}
			}
			++idx;
		}
	}
	
	getEmptyCount() {
		let idx = 0;
		while (typeof this.mColors[idx] != 'number') ++idx;
		return idx;
	}

	getTopColor() {
		for (let idx = 0, num = this.mColors.length; idx < num; ++idx) {
			let color = this.mColors[idx];
			if (typeof color == 'number') {
				let count = 1;
				while (this.mColors[idx + count] === color) ++count;
				return {color:color, count:count};
			}
		}
		return {color:EMPTY_COLOR, count:this.mColors.length};
	}
	
	toString() {
		return this.id + "=" + this.mColors + ";";
	}
	
	equals(obj) {
		if(typeof obj != typeof this)
			return false;
		if (!obj instanceof Bottle)
			return false;
		if (this.mColors.length != obj.mColors.length)
			return false;
		for (let idx = 0, num = this.mColors.length; idx < num; ++idx) {
			if (this.mColors[idx] !== obj.mColors[idx]) {
				return false;
			}
		}
		return true;
	}
	
	static fastClone(bottle) {
		const newBottle = new Bottle(bottle.id);
		newBottle.mColors = structuredClone(bottle.mColors);
		return newBottle;
	}
}

export class GetColorGame {

	mBottles = [];
	mPickedBottleIdx = null;
	mColors = [];

	constructor(conString) {
		this.conString = conString;
	}

	static getInstance(conString = null) {
		if (!this.instance) {
			this.instance = new GetColorGame(conString);
		}

		return this.instance;
	}
  
	get bottles() {
		let bottles = [];
		for (let idx = 0, num = this.mBottles.length; idx < num; ++idx) {
			let bottle = this.mBottles[idx];
			let bottleObj = {};
			bottleObj.id = bottle.id;
			bottleObj.colors = bottleObj.mColors = [];
			for (let colorIdx = 0, colorNum = bottle.colors.length; colorIdx < colorNum; ++colorIdx) {
				let colorIndex = bottle.colors[colorIdx];
				let color = typeof colorIndex == 'number' ? this.mColors[colorIndex] : colorIndex;
				bottleObj.colors.push(color);
			}
			bottles.push(bottleObj);
		}
		return bottles;
	}
  
	set bottles(value) {
		this.mBottles = [];
		this.mColors = [];
		for (let idx = 0, num = value.length; idx < num; ++idx)
		{
			let colors = value[idx].colors;
			for (let colorIdx = 0, colorNum = colors.length; colorIdx < colorNum; ++colorIdx) {
				let color = colors[colorIdx];
				if ( color === EMPTY_COLOR )
					continue;
				let colorIndex = this.mColors.indexOf(color);
				if ( colorIndex == -1 ) {
					colorIndex = this.mColors.length;
					this.mColors[colorIndex] = color;
				}
			}
		}
		this.mColors.sort();
		for (let idx = 0, num = value.length; idx < num; ++idx) {
			let colors = value[idx].colors;
			let colorArr = [];
			for (let colorIdx = 0, colorNum = colors.length; colorIdx < colorNum; ++colorIdx) {
				let color = colors[colorIdx];
				let colorIndex = this.mColors.indexOf(color);
				colorArr.push(colorIndex == -1 ? color : colorIndex);
			}
			this.mBottles[idx] = new Bottle(value[idx].id);
			this.mBottles[idx].colors = colorArr;
		}
	}
	
	getBottleCount() {
		return this.mBottles.length;
	}
	
	getColorCount() {
		return this.mColors.length;
	}
	
	getRawBottle(idx) {
		return this.mBottles[idx];
	}
	
	pickBottleIdx(idx) {
		this.mPickedBottleIdx = idx;
	}
	
	getPourCountInBottleIdx(bottleIdx) {
		const bottle = this.mBottles[bottleIdx];
		let prevColor = EMPTY_COLOR;
		let pourCount = 0;
		for (let colorIdx = 0, colorNum = bottle.colors.length; colorIdx < colorNum; ++colorIdx) {
			let color = bottle.colors[colorIdx];
			if (prevColor !== color) {
				prevColor = color;
				pourCount += 1;
			}
		}
		return pourCount;
	}
	
	canPourInBottleIdx(bottleIdx) {
		if (this.mPickedBottleIdx === null)
			return false;
		if (this.mPickedBottleIdx === bottleIdx)
			return false;
		
		const {color:srcColor, count:srcCount} = this.mBottles[this.mPickedBottleIdx].getTopColor();
		if (typeof srcColor != 'number')
			return false;

		const {color:dstColor, count:dstCount} = this.mBottles[bottleIdx].getTopColor();
		if (typeof dstColor != 'number')
			return dstCount >= srcCount;
		
		if (srcColor != dstColor)
			return false;
		const dstEmpty = this.mBottles[bottleIdx].getEmptyCount();
		if (dstEmpty < srcCount)
			return false;
		return true;
	}
	
	pourInBottleIdx(bottleIdx) {
		const srcBottle = this.mBottles[this.mPickedBottleIdx];
		const dstBottle = this.mBottles[bottleIdx];
		const {color:srcColor, count:srcCount} = srcBottle.getTopColor();
		let srcIdx = srcBottle.colors.indexOf(srcColor);
		for (let i = 0; i < srcCount; ++i) {
			srcBottle.colors[srcIdx + i] = dstBottle.colors[i];
			dstBottle.colors[i] = srcColor;
		}
		srcBottle.normalize();
		dstBottle.normalize();
	}

	indexOfBottle(bottleId) {
		for (let idx = 0, num = this.mBottles.length; idx < num; ++idx) {
			if (this.mBottles[idx].id === bottleId) {
				return idx;
			}
		}
		return -1;
	}
	
	getBottleById(bottleId) {
		for (let idx = 0, num = this.mBottles.length; idx < num; ++idx) {
			if (this.mBottles[idx].id === bottleId) {
				return this.mBottles[idx];
			}
		}
		return null;
	}
	
	pickBottle(bottleId) {
		for (let idx = 0, num = this.mBottles.length; idx < num; ++idx) {
			if (this.mBottles[idx].id === bottleId) {
				return this.mPickedBottleIdx = idx;
			}
		}
		return this.mPickedBottleIdx = null;
	}
	
	isBottlePicked(bottleId) {
		if (this.mPickedBottleIdx === null)
			return false;
		return this.mBottles[this.mPickedBottleIdx].id === bottleId;
	}
	
	canPour() {
		return this.mPickedBottleIdx !== null;
	}
	
	canPourInBottle(bottleId) {
		const bottleIdx = this.indexOfBottle(bottleId);
		if (bottleIdx == -1)
			return false;
		return this.canPourInBottleIdx(bottleIdx);
	}
	
	getTopColor(bottleId) {
		const bottle = this.getBottleById(bottleId);
		if (!bottle)
			return {color:null, count:null};
		return bottle.getTopColor();
	}
	
	getEmptyCount(bottleId) {
		const bottle = this.getBottleById(bottleId);
		if (!bottle)
			return 0;
		return bottle.getEmptyCount();
	}
	
	pourInBottle(bottleId) {
		const bottleIdx = this.indexOfBottle(bottleId);
		if (bottleIdx == -1)
			return false;
		return this.pourInBottleIdx(bottleIdx);
	}
	
	toString() {
		return this.conString + "=" + this.mBottles.join('') + "colors=" + this.mColors;
	}
	
	static fromJSON(jsonString) {
		let obj = (typeof jsonString == 'string') ? JSON.parse(jsonString) : jsonString;
		// const posEq = text.indexOf('=');
		// const posColors = text.lastIndexOf('colors=');
		// const conString = text.substring(0, posEq);
		// const bottlesStr = text.substring(posEq + 1, posColors);
		let game = new GetColorGame(obj.conString);
		for (let idx = 0, num = obj.mBottles.length; idx < num; ++idx) {
			const objBottle = obj.mBottles[idx];
			const bottle = new Bottle(objBottle.id);
			bottle.mColors = objBottle.mColors;
			game.mBottles[idx] = bottle;
		}
		game.mPickedBottleIdx = obj.mPickedBottleIdx;
		game.mColors = obj.mColors;
		return game;
	}
	
	// TSH (TinySimpleHash)
	static hashFunc = (s,h=9) => {for(let i=0;i<s.length;)h=Math.imul(h^s.charCodeAt(i++),9**9);return h^h>>>9}
	
	hashCode() {
		let bottleArr = [];
		for (let idx = 0, num = this.mBottles.length; idx < num; ++idx) {
			let colors = this.mBottles[idx].colors;
			bottleArr.push(colors.join(''));
		}
		bottleArr.sort();
		
		return bottleArr.reduce((acc, val)=>GetColorGame.hashFunc(val, acc), 0);
	}
	
	equals(obj) {
		if(typeof obj != typeof this)
			return false;
		if (!obj instanceof GetColorGame)
			return false;
		if (this.mBottles.length != obj.mBottles.length)
			return false;
		for (let idx = 0, num = this.mBottles.length; idx < num; ++idx) {
			let thisBottle = this.mBottles[idx];
			let objBottle = obj.mBottles[idx];
			if (!thisBottle.equals(objBottle)) {
				return false;
			}
		}
		return true;
	}
	
	isInSameState(obj) {
		if(typeof obj != typeof this)
			return false;
		if (!obj instanceof GetColorGame)
			return false;
		if (this.mBottles.length != obj.mBottles.length)
			return false;
		let thisBottleArr = [];
		let objBottleArr = [];
		for (let idx = 0, num = this.mBottles.length; idx < num; ++idx) {
			const thisColors = this.mBottles[idx].colors;
			thisBottleArr.push(thisColors.join('|'));

			const objColors = obj.mBottles[idx].colors;
			objBottleArr.push(objColors.join('|'));
		}
		thisBottleArr.sort();
		objBottleArr.sort();
		for (let idx = 0, num = thisBottleArr.length; idx < num; ++idx) {
			if (thisBottleArr[idx] != objBottleArr[idx]) {
				return false;
			}
		}
		return true;
	}
	
	fastClone() {
		return GetColorGame.fastClone(this, this.conString);
	}
	
	static fastClone(game, name = null) {
		const newGame = new GetColorGame(name);
		// no need to deep copy the colors
		newGame.mColors = game.mColors;
		newGame.mPickedBottleIdx = game.mPickedBottleIdx;
		
		// fastClone the bottles
		newGame.mBottles = [];
		for (let idx = 0, num = game.mBottles.length; idx < num; ++idx) {
			const newBottle = Bottle.fastClone(game.mBottles[idx]);
			newGame.mBottles[idx] = newBottle;
		}
		return newGame;
	}
}
const gColorGame = GetColorGame.getInstance('moduleInstance');
export default gColorGame;