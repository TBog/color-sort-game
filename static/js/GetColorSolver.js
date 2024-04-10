import PriorityQueue from './PriorityQueue.js'

class GetColorSolver {
	constructor(game) {
		this.mGame = game;
	}
	
	solve(algorithm) {
		algorithm.start(this.mGame);
		while (!GetColorSolver.isGameSolved(algorithm)) {
			if (!algorithm.step())
			{
				return null;
			}
		}
		algorithm.stop();
		return algorithm;
	}
	
	static isGameSolved(algorithm) {
		const game = algorithm.getGame()
		for (let bottleIdx = 0, bottleNum = game.getBottleCount(); bottleIdx < bottleNum; ++bottleIdx) {
			const bottle = game.getRawBottle(bottleIdx);
			const colorNum = bottle.colors.length;
			if (colorNum == 0)
				continue;
			const color = bottle.colors[0];
			for (let colorIdx = 1; colorIdx < colorNum; ++colorIdx) {
				if (bottle.colors[colorIdx] !== color) {
					return false;
				}
			}
		}
		return true;
	}
}

class SolveAlgorithm {
	mGame = null;
	
	start(game){
		this.mGame = game;
	}
	
	getGame() {
		return this.mGame;
	}
	
	getSolution() {
		return null;
	}
	
	step(){}
	stop(){}
}

class SolveHeuristic {
	getWeight(game) {
		return 0;
	}
}

class MergeColors extends SolveHeuristic {
	getWeight(game) {
		let pourCount = 0;
		for (let idx = 0, num = game.getBottleCount(); idx < num; ++idx) {
			const pourCountInBottle = game.getPourCountInBottleIdx(idx);
			pourCount += pourCountInBottle <= 1 ? 1 : (pourCountInBottle * 2);
		}
		return pourCount;
	}
}

class AStarAlgorithm extends SolveAlgorithm {
	_queue = new PriorityQueue((a, b) => a.weight > b.weight);
	_visited = new Map();
	_maxQueueSize = 0;
	
	constructor(heuristic = new MergeColors()) {
		super();
		this._heuristic = heuristic;
	}
	
	start(game) {
		super.start(game);
		this.addToQueue(game.hashCode(), {game:game, weight:0, moves:0});
	}

	getGame() {
		const num = this._queue.size();
		if (num == 0)
			return super.getGame();
		let currentState = this._queue.peek();
		return currentState.game;
	}

	getSolution() {
		if (this._queue.size() == 0)
			return super.getSolution();
		return this._queue.peek();
	}

	step() {
		let currentState = this._queue.pop();
		if (currentState) {
			this.generate(currentState);
			return true;
		}
		return false;
	}
	
	stop() {
		console.log("maxQueueSize = " + this._maxQueueSize);
	}

	generate(state) {
		const game = state.game;
		const moves = state.moves + 1;
		const num = game.getBottleCount();
		for (let pickIdx = 0; pickIdx < num; ++pickIdx) {
			game.pickBottleIdx(pickIdx);
			for (let idx = 0; idx < num; ++idx) {
				if (!game.canPourInBottleIdx(idx))
					continue;
				const clonedGame = game.fastClone();
				clonedGame.pourInBottleIdx(idx);
				const hash = clonedGame.hashCode();
				const weight = this._heuristic.getWeight(clonedGame) + moves;
				const newState = {game:clonedGame, weight:weight, moves:moves, pourFromBottleIdx:pickIdx, pourInBottleIdx:idx, previousState:state};
				this.addToQueue(hash, newState);
			}
		}
		const s = this._queue.size();
		this._maxQueueSize = this._maxQueueSize < s ? s : this._maxQueueSize;
	}

	addToQueue(hash, state) {
		const game = state.game;
		let arr = this._visited.get(hash);
		if (arr)
		{
			for (let idx = 0, num = arr.length; idx < num; ++idx) {
				if (game.isInSameState(arr[idx]))
					return false;
			}
			arr.push(game);
		} else {
			arr = [game];
			this._visited.set(hash, arr);
		}
		this._queue.push(state);
		return true;
	}
}

class DepthFirstSearchAlgorithm extends SolveAlgorithm {
	mStack = [];
	mGeneratedCache = new Map();
	_maxStackSize = 0;
	
	start(game) {
		super.start(game);
		this.addToStack(game.hashCode(), {game:game});
	}

	stop() {
		//console.log(this.mStack.length > 0 ? this.mStack[this.mStack.length - 1] : this.mStack);
		console.log("maxStackSize = " + this._maxStackSize);
	}
	
	getGame() {
		if (this.mStack.length == 0)
			return super.getGame();
		let currentState = this.mStack[this.mStack.length - 1];
		return currentState.game;
	}

	getSolution() {
		if (this.mStack.length == 0)
			return super.getSolution();
		return this.mStack[this.mStack.length - 1];
	}
	
	step() {
		let currentState = this.mStack.pop();
		if (currentState) {
			this.generate(currentState);
			return true;
		}
		return false;
	}

	generate(state) {
		const game = state.game;
		const num = game.getBottleCount();
		for (let pickIdx = 0; pickIdx < num; ++pickIdx) {
			game.pickBottleIdx(pickIdx);
			for (let idx = 0; idx < num; ++idx) {
				if (!game.canPourInBottleIdx(idx))
					continue;
				const clonedGame = game.fastClone();
				clonedGame.pourInBottleIdx(idx);
				const hash = clonedGame.hashCode();
				const newState = {game:clonedGame, pourFromBottleIdx:pickIdx, pourInBottleIdx:idx, previousState:state};
				this.addToStack(hash, newState);
			}
		}
		this._maxStackSize = this._maxStackSize < this.mStack.length ? this.mStack.length : this._maxStackSize;
	}
	
	addToStack(hash, state) {
		const game = state.game;
		let arr = this.mGeneratedCache.get(hash);
		if (arr)
		{
			for (let idx = 0, num = arr.length; idx < num; ++idx) {
				if (game.isInSameState(arr[idx]))
					return false;
			}
			arr.push(game);
		} else {
			arr = [game];
			this.mGeneratedCache.set(hash, arr);
		}
		this.mStack.push(state);
		return true;
	}
}

class BreadthFirstSearchAlgorithm extends SolveAlgorithm {
	mQueue = [];
	mGeneratedCache = new Map();
	_maxQueueSize = 0;
	
	start(game) {
		super.start(game);
		this.addToQueue(game.hashCode(), {game:game});
	}
	
	stop() {
		//console.log(this.mQueue.length > 0 ? this.mQueue[0] : this.mQueue);
		console.log("maxQueueSize = " + this._maxQueueSize);
	}
	
	getGame() {
		if (this.mQueue.length == 0)
			return super.getGame();
		let currentState = this.mQueue[0];
		return currentState.game;
	}

	getSolution() {
		if (this.mQueue.length == 0)
			return super.getSolution();
		return this.mQueue[0];
	}
	
	step() {
		let currentState = this.mQueue.shift();
		if (currentState) {
			this.generate(currentState);
			return true;
		}
		return false;
	}
	
	generate(state) {
		const game = state.game;
		const num = game.getBottleCount();
		for (let pickIdx = 0; pickIdx < num; ++pickIdx) {
			game.pickBottleIdx(pickIdx);
			for (let idx = 0; idx < num; ++idx) {
				if (!game.canPourInBottleIdx(idx))
					continue;
				const clonedGame = game.fastClone();
				clonedGame.pourInBottleIdx(idx);
				const hash = clonedGame.hashCode();
				const newState = {game:clonedGame, pourFromBottleIdx:pickIdx, pourInBottleIdx:idx, previousState:state};
				this.addToQueue(hash, newState);
			}
		}
		this._maxQueueSize = this._maxQueueSize < this.mQueue.length ? this.mQueue.length : this._maxQueueSize;
	}
	
	addToQueue(hash, state) {
		const game = state.game;
		let arr = this.mGeneratedCache.get(hash);
		if (arr)
		{
			for (let idx = 0, num = arr.length; idx < num; ++idx) {
				if (game.isInSameState(arr[idx]))
					return false;
			}
			arr.push(game);
		} else {
			arr = [game];
			this.mGeneratedCache.set(hash, arr);
		}
		this.mQueue.push(state);
		return true;
	}
}

export {GetColorSolver, BreadthFirstSearchAlgorithm, DepthFirstSearchAlgorithm, AStarAlgorithm};