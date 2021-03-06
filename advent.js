		var div = document.getElementById("div");
		var input = document.getElementById("input");
		div.innerHTML = "asd";
		
		function printMatrix(matrix, display ) {
			var str = '';
			var count = 0;
			for(var i in matrix) {
				for(var j in matrix[i]) {
					str += display(matrix[i][j]) + ' ';
					count++;
				}

				str += '<br>\n';
			}

			return str + matrix[0].length + ' x ' + matrix.length + ', total: ' + count + '<br>\n';
		}

		function createTestCase(method, expectedOutput, inputParams) {
			return {
				method: method,
				expectedOutput: expectedOutput,
				arguments: Array.prototype.slice.call(arguments, 2)
			};
		}

		function runTests(testCases) {
				for(var i in testCases) {
					var test = testCases[i];
					var res = test.method.apply(null, test.arguments);
					if(res == test.expectedOutput || res && test.expectedOutput && res.toString() == test.expectedOutput.toString()) {
						console.log('PASSED!');
					} else {
						console.log('FAILED!');
						console.log('Expected: ' + test.expectedOutput);
						console.log('Actual:   ' + res);
					}
				}
		}

		function permutations(arr, callback) {
			var perm = function(arr, used, res, ind) {
				if( ind == arr.length ) {
					callback(res);
					return;
				}

				for(var i = 0; i < used.length; i++) {
					if(!used[i]) {
						res.push(arr[i]);
						used[i] = true;

						perm(arr, used, res, ind + 1);

						used[i] = false;
						res.pop();
					}
				}
			};

			perm(arr, Array(arr.length), [], 0);
		}

		window.onload = () => refresh({value: input.value});

		function refresh(e) {
			div.innerHTML = day25(e.value);
		}
		
		
		function day25(input) {
			var registers = { a: 0, b: 0, c: 0, d: 0 };
			var currentInstr = 0;
			var instructions = input.trim().split('\n');
			var outStr = '';

			var jumpTo = function(instr) {
				currentInstr += instr;
			};

			var resolveArg = function(arg) {
				if(isNaN(arg))
					return registers[arg];

				return parseInt(arg);
			};

			var lastd = 0;
			var tglMap = {
				inc: 'dec',
				dec: 'inc',
				tgl: 'inc',

				cpy: 'jnz',
				jnz: 'cpy'
			};

			var ops = {
				cpy: function( x, y ) {
					if( undefined != registers[y] )
						registers[y] = resolveArg(x);
					jumpTo(1);
				},
				inc: function(x) {
					if( undefined != registers[x] )
						registers[x] += 1;
					jumpTo(1);
				},
				dec: function(x) {
					if( undefined != registers[x] )
						registers[x] -= 1;
					jumpTo(1);
				},
				jnz: function(x, y) {
					if( resolveArg(x) != 0 ) {
						jumpTo(resolveArg(y));
					} else {
						jumpTo(1);
					}
				},
				tgl: function(x) { 
					var i = resolveArg(x) + currentInstr;
					if( i < instructions.length )
						instructions[i] = tglMap[instructions[i].substr(0, 3)] + instructions[i].substr(3);
					jumpTo(1);
				},
				out: function(x) { 
					outStr += resolveArg(x);
					jumpTo(1);
				}
			};

			var reg = /(\w{3}) (-*\w*) *(-*\w*)/;

			for(var i = 0; i <= 2730; i++) {
				registers.b = registers.c = registers.d = 0;
				outStr = '';
				registers.a = i;
				var sc = 1000000;
				while( currentInstr < instructions.length && outStr.length < 36 && sc-- > 0) {
					// console.log(currentInstr, instructions[currentInstr], registers);
					var res = reg.exec(instructions[currentInstr]);
					var name = res[1];
					var args = res.splice(2);
					ops[name].apply(null, args);
				}

				console.log(i, outStr);
				if( outStr.startsWith( '010101010101' ) ) {
					//0 - 001001111001001001111001001001111001
					//1 - 101001111001101001111001101001111001
					console.log(i, outStr);
					return i;
				}
			}		

			//2730 -- to high	

			return false;
		}

		function day24(input) {
			var iterateMatrix = function(matrix, callback) {
				for(var i = 0 ; i < matrix.length; i++) {
					for(var j = 0; j < matrix[i].length; j++) {
						callback(matrix[i][j], j, i);
					}
				}
			};

			var parseInput = function(input) {
				input = input.trim().split('\n');
				var res = [];
				for(var i in input) {
					var row = [];
					for(var j in input[i]) {
						row.push(input[i][j]);
					}
					res.push(row);
				}

				return res;
			};

			var shortestPathBetweenTwoNodes = function(matrix, node1X, node1Y, node2X, node2Y) {
				
				var visited = {};
				var q = [{x:node1X, y: node1Y, len: 0}];
				visited[node1X+','+node1Y] = true;

				while(q.length) {
					var currentNode = q.shift();
					if(currentNode.x == node2X && currentNode.y == node2Y)
						return currentNode.len;

					var indices = [[-1, 0],[1, 0], [0, -1], [0, 1]];
					for(var i in indices) {
						var x = currentNode.x + indices[i][0];
						var y = currentNode.y + indices[i][1];
						if(x >= 0 && y >= 0 && y < matrix.length && x < matrix[0].length
						&& !visited[x+','+y]
						&& matrix[y][x] != '#'){
							visited[x+','+y] = true;
							q.push({x: parseInt(x), y: parseInt(y), len: currentNode.len + 1});
						}
					}
				}

				return false;
			};

			var matrix = parseInput(input);
			var endNodes = [];

			iterateMatrix(matrix, function(el, x, y) {
				if(el != '.' && el != '#') {
					endNodes.push([x, y, el]);
				}
			});


			var shortestPaths = Array(endNodes.length);
			for(var i in endNodes) {
				for(var j in endNodes) {
					var p = shortestPathBetweenTwoNodes(matrix, endNodes[i][0], endNodes[i][1], endNodes[j][0], endNodes[j][1]);
					if(!shortestPaths[endNodes[i][2]])
						shortestPaths[endNodes[i][2]] = Array(endNodes.length);

					shortestPaths[endNodes[i][2]][endNodes[j][2]] = p;
				}
			}
			
			var findTotalPath = function(path, pathLengths) {
				var sum = 0;
				for(var i = 1; i < path.length; i ++) {
					sum += pathLengths[path[i-1]][path[i]];
				}

				return sum;
			};

			endNodes = endNodes.map((a) => a[2]);

			var p1 = function(input) {
			var minPath = Number.MAX_VALUE;
				permutations(endNodes, function(path) {
					if(path[0] == 0)
						minPath = Math.min(minPath, findTotalPath(path, shortestPaths));
				});

				return minPath;
			};
			
			var p2 = function(input) {
				var minPath = Number.MAX_VALUE;
				permutations(endNodes, function(path) {
					if(path[0] == 0)
						minPath = Math.min(minPath, findTotalPath(path, shortestPaths) + shortestPaths[path[path.length - 1]][0]);
				});

				return minPath;
			};

			console.log(p1(input));
			console.log(p2(input));
		}
		
		function day23(input) {
			var registers = { a: 7, b: 0, c: 0, d: 0 };
			var currentInstr = 0;
			var instructions = input.trim().split('\n');

			var jumpTo = function(instr) {
				currentInstr += instr;
			};

			var resolveArg = function(arg) {
				if(isNaN(arg))
					return registers[arg];

				return parseInt(arg);
			};

			var lastd = 0;
			var tglMap = {
				inc: 'dec',
				dec: 'inc',
				tgl: 'inc',

				cpy: 'jnz',
				jnz: 'cpy'
			};

			var ops = {
				cpy: function( x, y ) {
					if( undefined != registers[y] )
						registers[y] = resolveArg(x);
					jumpTo(1);
				},
				inc: function(x) {
					if( undefined != registers[x] )
						registers[x] += 1;
					jumpTo(1);
				},
				dec: function(x) {
					if( undefined != registers[x] )
						registers[x] -= 1;
					jumpTo(1);
				},
				jnz: function(x, y) {
					if( resolveArg(x) != 0 ) {
						jumpTo(resolveArg(y));
					} else {
						jumpTo(1);
					}
				},
				tgl: function(x) { 
					var i = resolveArg(x) + currentInstr;
					if( i < instructions.length )
						instructions[i] = tglMap[instructions[i].substr(0, 3)] + instructions[i].substr(3);
					jumpTo(1);
				}
			};

			var reg = /(\w{3}) (-*\w*) *(-*\w*)/;
			while( currentInstr < instructions.length) {
				console.log(currentInstr, instructions[currentInstr], registers);
				var res = reg.exec(instructions[currentInstr]);
				var name = res[1];
				var args = res.splice(2);
				ops[name].apply(null, args);
			}

			//part 2 - 479006783
			return registers.a;
		}


		function day22(input) {


			var p1 = function(input) {

				var processInput = function(input){
					var nodes = [];
					var reg = /\/dev\/grid\/node-x(\d+)-y(\d+)\s+\d+\w\s+(\d+)\w\s+(\d+)/;
					var lines = input.trim().split('\n');
					for(var i = 2; i < lines.length; i++) {
						var [_, x, y, used, available] = reg.exec(lines[i]);
						nodes.push({
							x: parseInt(x),
							y: parseInt(y),
							used: parseInt(used),
							available: parseInt(available)
						});
					}

					return nodes;
				};

				var nodes = processInput(input);
				var counted = {};
				var count = 0;
				for(var i = 0; i < nodes.length; i++) {
					var n1 = nodes[i];
					if(n1.used == 0)
						continue;

					for(var j = 0; j < nodes.length; j++) {
						var n2 = nodes[j];
						if(n1.used <= n2.available &&
							!counted[n1.x + ',' + n1.y + ',' + n2.x + ',' + n2.y]) {
							counted[n1.x + ',' + n1.y + ',' + n2.x + ',' + n2.y] = true;
							count++;
						}
					}
				}

				return count;
			};

			var p2 = function(input) {

				var reg = /\/dev\/grid\/node-x(\d+)-y(\d+)\s+\d+\w\s+(\d+)\w\s+(\d+)/;
				var lines = input.trim().split('\n');
				var maxUsed = 0, minTotal = 1000;
				for(var i = 0; i < lines.length; i++) {
					var [_, x, y, used, available] = reg.exec(lines[i]);
					used = parseInt(used);
					total = used + parseInt(available);
					if(used < 100)
						maxUsed = Math.max(maxUsed, used);

					if(total < 300)
						minTotal = Math.min(minTotal, total);
				}
				debugger;
				
				var processInput = function(input){
					var nodes = [];
					var empty = {
							x: -1,
							y: -1,
							isTarget: false
						};
					var reg = /\/dev\/grid\/node-x(\d+)-y(\d+)\s+\d+\w\s+(\d+)\w\s+(\d+)/;
					var lines = input.trim().split('\n');
					for(var i = 0; i < lines.length; i++) {
						var [_, x, y, used, available] = reg.exec(lines[i]);
						if(!nodes[y])
							nodes[y] = [];

						nodes[y][x] = {
							used: parseInt(used),
							available: parseInt(available),
							isTarget: false
						};

						if(used == 0) {
							empty.x = x;
							empty.y = y;
						}
					}

					return {nodes: nodes, empty: empty};
				};

				var findPossibleMoves = function(nodes, x, y) {
					var moves = [];
					if( x > 0 && nodes[y][x-1].used <= nodes[y][x].available) {
						moves.push({
							fromX: x - 1,
							fromY: y,
							toX  : x,
							toY  : y
						});
					}
					if( y > 0 && nodes[y - 1][x].used <= nodes[y][x].available) {
						moves.push({
							fromX: x,
							fromY: y - 1,
							toX  : x,
							toY  : y
						});
					}
					if( x + 1 < nodes[y].length && nodes[y][x+1].used <= nodes[y][x].available) {
						moves.push({
							fromX: x + 1,
							fromY: y,
							toX  : x,
							toY  : y
						});
					}
					if( y + 1 < nodes.length && nodes[y + 1][x].used <= nodes[y][x].available) {
						moves.push({
							fromX: x,
							fromY: y + 1,
							toX  : x,
							toY  : y
						});
					}
					return moves;
				};

				var snapshotState = function(nodes) {
					return printMatrix(nodes, function(item){
							if(item.isTarget) return 'G';
							if(item.used > 100) return '#';
							if(item.used == 0) return '_';
							return '.';
						});

					var state = '';
					for(var y = 0; y < nodes.length; y++) {
						for (var x = 0; x < nodes[y].length; x++) {
							state += nodes[y][x].available + '/'
							+ nodes[y][x].used + '/'
							+ nodes[y][x].isTarget + '; ';
						}
						state += '\n';
					}
					return state;
				}

				var performMove = function(nodeState, move) {
					var nFrom = nodeState.nodes[move.fromY][move.fromX];
					var nTo = nodeState.nodes[move.toY][move.toX];

					var state = JSON.parse(JSON.stringify({from: nFrom, to: nTo}));

					nTo.used += nFrom.used;
					nTo.available -= nFrom.used;
					nFrom.available += nFrom.used;
					nFrom.used = 0;

					if(nFrom.isTarget) {
						nFrom.isTarget = false;
						nTo.isTarget = true;
					}

					nodeState.emptyNode.x = move.fromX;
					nodeState.emptyNode.y = move.fromY;

					return state;
				};

				var reverseMove = function(nodeState, move, state) {
					nodeState.nodes[move.fromY][move.fromX] = state.from;
					nodeState.nodes[move.toY][move.toX] = state.to;

					nodeState.emptyNode.x = move.toX;
					nodeState.emptyNode.y = move.toY;
				};


				var BFS = function(nodes, emptyNode) {

					// 216 -- too low

					nodes[0][nodes[0].length - 1].isTarget = true;

					var visited = {};
					var q = [JSON.parse(JSON.stringify({emptyNode: emptyNode, nodes: nodes, moves: 0}))];
					visited[snapshotState(nodes)] = true;

					while(q.length > 0) {
						var state = q.shift();

						// console.log(printMatrix(state.nodes, function(item){
						// 	if(item.isTarget) return 'G';
						// 	if(item.used > 100) return '#';
						// 	if(item.used == 0) return '_';
						// 	return '.';
						// }));

						if(state.emptyNode.x == state.nodes[0].length - 2 && state.emptyNode.y == 0) {
							return state.moves;
						}
					
						var moves = findPossibleMoves(state.nodes, state.emptyNode.x, state.emptyNode.y);

						for(var i in moves) {
							var st = performMove(state, moves[i]);
							state.moves++;
							var snap = snapshotState(state.nodes);
							if(!visited[snap]) {
								visited[snap] = true;
								q.push(JSON.parse(JSON.stringify(state)));
							}
							reverseMove(state, moves[i], st);
							state.moves--;
						}

					}

					return false;
				};

				var inp = processInput(input);
				var nodes = inp.nodes;
				var emptyNode = inp.empty;
				return BFS(nodes, emptyNode);
			};

			return p2(input);
		}

		function day21(input) {
			var swapPos = function(str, x, y) {
				var a1 = Math.min(x, y),
					a2 = Math.max(x, y);

				return    str.substr(0, a1)
						+ str[a2]
						+ str.substr(a1 + 1, a2 - a1 - 1)
						+ str[a1]
						+ str.substr(a2 + 1);
			};

			var swapLetter = function(str, x, y) {
				return str.replace(new RegExp(x, 'g'), '#')
						  .replace(new RegExp(y, 'g'), x)
						  .replace(/#/g, y);
			};

			var rotate = function(str, direction, steps, rev) {
				var steps = steps % str.length;

				if( direction == "left" && !rev || direction == "right" && rev ) {
					return str.substr(steps) + str.substr(0, steps);
				} else {
					return str.substr(str.length - steps) + str.substr(0, str.length - steps);
				}
			};

			var rotateAroundLetter = function(str, letter, rev) {
				var ind = str.indexOf(letter);

				var rotations     = [1,2,3,4,6,7,0,1];
				var rotations_rev = [7,7,2,6,1,5,0,4];

				var rots = rev ? rotations_rev[ind] : rotations[ind];

				return rotate(str, "right", rots);
			};

			var reverse = function(str, x, y) {
				var a1 = Math.min(x, y),
					a2 = Math.max(x, y);

				return str.substr(0, a1)
					 + str.substr(a1, a2 - a1 + 1).split('').reverse().join('')
					 + str.substr(a2 + 1);
			};

			var move = function(str, x, y) {
				var c = str[x];
				var tmp = str.substr(0, x) + str.substr(x + 1);
				return tmp.substr(0, y) + c + tmp.substr(y);
			};

			var processLine = function(line, word, rev) {
				var parts = line.split(' ');
				if(line.startsWith("swap position")) {
					return swapPos(word, parseInt(parts[2]), parseInt(parts[5]));
				}
				else if(line.startsWith("swap letter")) {
					return swapLetter(word, parts[2], parts[5]);
				}
				else if(line.startsWith("rotate based")) {
					return rotateAroundLetter(word, parts[6], rev);
				}
				else if(line.startsWith("rotate")) {
					return rotate(word, parts[1], parseInt(parts[2]), rev);
				}
				else if(line.startsWith("reverse")) {
					return reverse(word, parseInt(parts[2]), parseInt(parts[4]));
				}
				else if(line.startsWith("move")) {
					if(rev) {
						return move(word, parseInt(parts[5]), parseInt(parts[2]));
					}
					else {
						return move(word, parseInt(parts[2]), parseInt(parts[5]));
					}					
				}
				else {
					throw new Exception("Wrong command!");
				}
			};

			var words1, words2;

			var p1 = function(input) {
				var word = 'abcdefgh';
				var lines = input.trim().split('\n');
				words1 = [word];

				for(var i in lines) {
					var l = lines[i];
					word = processLine(lines[i], word, false);
					words1.push(word);
				}

				return word;
			};

			var p2 = function(input) {
				var word = 'fbgdceah';
				var lines = input.trim().split('\n');
				words2 = [word];

				for(var i = lines.length - 1; i >= 0; i--) {
					var l = lines[i];
					word = processLine(lines[i], word, true);
					words2.push(word);
				}

				return word;
			};

			return p2(input);

			// p1(input);
			// p2(input);

			// words2.reverse();

			// for(var i = words2.length - 1; i >= 0; i--) {
			// 	if(words1[i] != words2[i]) {
			// 		console.log(i);
			// 		console.log(words1[i], words2[i]);
			// 		break;
			// 	}
			// }

			var testCases = [];

			// testCases.push(createTestCase(swapPos, '1432', '1234', 1, 3));
			// testCases.push(createTestCase(swapPos, '1432', '1234', 3, 1));
			// testCases.push(createTestCase(swapPos, 'cweasdzxq', 'qweasdzxc', 0, 8));
			// testCases.push(createTestCase(swapPos, 'qweacdzxs', 'qweasdzxc', 4, 8));
			// testCases.push(createTestCase(swapPos, 'sweaqdzxc', 'qweasdzxc', 4, 0));

			// testCases.push(createTestCase(swapLetter, 'cweasdzxq', 'qweasdzxc', 'q', 'c'));
			// testCases.push(createTestCase(swapLetter, 'qqwwssaad', 'qqwwaassd', 'a', 's'));
			// testCases.push(createTestCase(swapLetter, 'qqwwsasad', 'qqwwasasd', 'a', 's'));

			// testCases.push(createTestCase(rotate, 'dqweas', 'asdqwe', 'left', 2));
			// testCases.push(createTestCase(rotate, 'weasdq', 'asdqwe', 'right', 2));

			testCases.push(createTestCase(rotateAroundLetter, 'habcdefg', 'abcdefgh', 'a', false));
			testCases.push(createTestCase(rotateAroundLetter, 'efghabcd', 'abcdefgh', 'd', false));
			testCases.push(createTestCase(rotateAroundLetter, 'cdefghab', 'abcdefgh', 'e', false));
			testCases.push(createTestCase(rotateAroundLetter, 'abcdefgh', 'abcdefgh', 'g', false));
			testCases.push(createTestCase(rotateAroundLetter, 'habcdefg', 'abcdefgh', 'h', false));

			testCases.push(createTestCase(rotateAroundLetter, 'abcdefgh', rotateAroundLetter('abcdefgh', 'a', false), 'a', true));
			testCases.push(createTestCase(rotateAroundLetter, 'abcdefgh', rotateAroundLetter('abcdefgh', 'b', false), 'b', true));
			testCases.push(createTestCase(rotateAroundLetter, 'abcdefgh', rotateAroundLetter('abcdefgh', 'c', false), 'c', true));
			testCases.push(createTestCase(rotateAroundLetter, 'abcdefgh', rotateAroundLetter('abcdefgh', 'd', false), 'd', true));
			testCases.push(createTestCase(rotateAroundLetter, 'abcdefgh', rotateAroundLetter('abcdefgh', 'e', false), 'e', true));
			testCases.push(createTestCase(rotateAroundLetter, 'abcdefgh', rotateAroundLetter('abcdefgh', 'f', false), 'f', true));
			testCases.push(createTestCase(rotateAroundLetter, 'abcdefgh', rotateAroundLetter('abcdefgh', 'g', false), 'g', true));
			testCases.push(createTestCase(rotateAroundLetter, 'abcdefgh', rotateAroundLetter('abcdefgh', 'h', false), 'h', true));

			// testCases.push(createTestCase(reverse, 'sadqwe', 'asdqwe', 0, 1));
			// testCases.push(createTestCase(reverse, 'ewqdsa', 'asdqwe', 0, 5));
			// testCases.push(createTestCase(reverse, 'asdewq', 'asdqwe', 3, 5));
			// testCases.push(createTestCase(reverse, 'aswqde', 'asdqwe', 2, 4));

			// testCases.push(createTestCase(move, 'asqwde', 'asdqwe', 2, 4));
			// testCases.push(createTestCase(move, 'dasqwe', 'asdqwe', 2, 0));
			// testCases.push(createTestCase(move, 'sdqwea', 'asdqwe', 0, 5));
			
			// testCases.push(createTestCase(processInput, 'decab', 'swap position 4 with position 0\nswap letter d with letter b\nreverse positions 0 through 4\nrotate left 1 step\nmove position 1 to position 4\nmove position 3 to position 0\nrotate based on position of letter b\nrotate based on position of letter d', 'abcde'));
			
			runTests(testCases);
		}

		function day20(input) {

			var parseInput = function(input) {
				var ranges = input.split('\n');
				var res = [];
				for(var i in ranges) {
					var r = ranges[i].split('-');
					res.push([parseInt(r[0]), parseInt(r[1])]);
				}

				return res;
			};


			var p1 = function(input) {
				var ranges = parseInput(input);

				ranges.sort((a, b) => a[0] - b[0]);
				console.log(ranges);

				if( ranges[0][0] > 0 ) return 0;

				for(var i = 1; i < ranges.length; i++) {
					if(ranges[i][0] > ranges[i - 1][1] + 1) {
						return ranges[i - 1][1] + 1;
					}
				}

				return ranges[ranges.length - 1][1];
			};

			var p2 = function(input, max) {
				var ranges = parseInput(input);

				ranges.sort((a, b) => a[0] - b[0]);
				var currentCount = max - ranges[0][1] + ranges[0][0] - 1;
				var rightBound = ranges[0][1];

				for(var i = 0; i < ranges.length; i++) {
					var r = ranges[i];
					if(r[0] < rightBound) {
						if(r[1] > rightBound) {
							currentCount = currentCount - r[1] + rightBound;
							rightBound = r[1];
						} //else the whole range overlaps with the previous, so no removal
					} else {
						currentCount = currentCount - r[1] + r[0] - 1;
						rightBound = r[1];
					}
				}

				return currentCount;
			};


			var testCases = [];

			testCases.push(createTestCase(p1, 3, '5-8\n0-2\n4-7'));
			testCases.push(createTestCase(p2, 2, '5-8\n0-2\n4-7', 10));
			
			// runTests(testCases);
			return p2(input, 4294967296);
		}

		function day19(input) {
			var p01 = function(elves) {
				var arr = [];
				for(var i = 1; i < elves + 1; i ++)
					arr.push(i);

				while(arr.length > 1) {
					arr.push(arr.shift());
					arr.shift();
				} 

				return arr[0];
			};

			var p1 = function(elves) {
				var next = 1;
				while( next < elves ) {
					next = next * 2 + 1;
				}

				return elves * 2 - next;
			};

			var p02 = function(elves) {
				var arr = [];
				for(var i = 1; i < elves + 1; i ++)
					arr.push(i);

				while(arr.length > 1) {
					arr.splice(Math.floor(arr.length / 2), 1);
					arr.push(arr.shift());
				} 

				return arr[0];
			};

			var p2 = function(elves) {
				var next = 1;
				while( next < elves ) {
					next *= 3;
				}

				for( var i = next; i > elves; i-- ) {
					if( next * 2 > i ) {
						next -= 2;
					}
					else {
						next--;
					}
				}

				return next;
			};


			var testCases = [];

			// testCases.push(createTestCase(p01, 1, 4));
			// testCases.push(createTestCase(p01, 3, 5));
			// testCases.push(createTestCase(p01, 5, 6));
			// testCases.push(createTestCase(p01, 7, 7));
			// testCases.push(createTestCase(p01, 3, 9));
			// testCases.push(createTestCase(p01, 7, 11));
			// testCases.push(createTestCase(p01, 11, 13));
			// testCases.push(createTestCase(p01, 15, 15));
			// testCases.push(createTestCase(p01, 3, 17));

			// testCases.push(createTestCase(p01, 1, 8));
			// testCases.push(createTestCase(p01, 9, 12));

			// testCases.push(createTestCase(p1, 1, 4));
			// testCases.push(createTestCase(p1, 3, 5));
			// testCases.push(createTestCase(p1, 5, 6));
			// testCases.push(createTestCase(p1, 7, 7));
			// testCases.push(createTestCase(p1, 3, 9));
			// testCases.push(createTestCase(p1, 7, 11));
			// testCases.push(createTestCase(p1, 11, 13));
			// testCases.push(createTestCase(p1, 15, 15));
			// testCases.push(createTestCase(p1, 3, 17));

			// testCases.push(createTestCase(p1, 1, 8));
			// testCases.push(createTestCase(p1, 9, 12));
			// testCases.push(createTestCase(p1, 9, 3005290));

			// testCases.push(createTestCase(p02, 1, 4));
			// testCases.push(createTestCase(p02, 2, 5));
			// testCases.push(createTestCase(p02, 3, 6));
			// testCases.push(createTestCase(p02, 5, 7));
			// testCases.push(createTestCase(p02, 7, 8));
			// testCases.push(createTestCase(p02, 9, 9));
			// testCases.push(createTestCase(p02, 1, 10));
			// testCases.push(createTestCase(p02, 2, 11));
			// testCases.push(createTestCase(p02, 3, 12));
			// testCases.push(createTestCase(p02, 4, 13));
			// testCases.push(createTestCase(p02, 5, 14));
			// testCases.push(createTestCase(p02, 6, 15));

			testCases.push(createTestCase(p2, 1, 4));
			testCases.push(createTestCase(p2, 2, 5));
			testCases.push(createTestCase(p2, 3, 6));
			testCases.push(createTestCase(p2, 5, 7));
			testCases.push(createTestCase(p2, 7, 8));
			testCases.push(createTestCase(p2, 9, 9));
			testCases.push(createTestCase(p2, 1, 10));
			testCases.push(createTestCase(p2, 2, 11));
			testCases.push(createTestCase(p2, 3, 12));
			testCases.push(createTestCase(p2, 4, 13));
			testCases.push(createTestCase(p2, 5, 14));
			testCases.push(createTestCase(p2, 6, 15));

			testCases.push(createTestCase(p2, '??', 3005290));
			
			runTests(testCases);

			// for(var i = 0; i <= 100; i++) {
			// 	var res = p02(i);
			// 	// if( i == res )
			// 		console.log(i + ': ' + res);
			// }
		}

		function day18(input) {
			var d1 = function(rows, firstLine) {
				var currentLine = '.' + firstLine + '.';
				var mines = currentLine.match(/\./g).length - 2;

				for(var i = 1; i < rows; i++) {
					var newLine = '.';

					for(var j = 1; j < currentLine.length - 1; j++) {
						if( currentLine[j - 1] == '^' && currentLine[j] == '^' && currentLine[j + 1] == '.'
						 || currentLine[j - 1] == '.' && currentLine[j] == '^' && currentLine[j + 1] == '^'
						 || currentLine[j - 1] == '^' && currentLine[j] == '.' && currentLine[j + 1] == '.'
						 || currentLine[j - 1] == '.' && currentLine[j] == '.' && currentLine[j + 1] == '^' )
							newLine += '^';
						else 
							newLine += '.';
						}

					newLine += '.';
					mines += newLine.match(/\./g).length - 2;
					currentLine = newLine;
				}

				return mines;
			};

			var [rows, currentLine] = input.split('\n');

			var testCases = [];
			testCases.push(createTestCase(d1, 6, '3', '..^^.'));
			testCases.push(createTestCase(d1, 38, '10', '.^^.^.^^^^'));
			
			//runTests(testCases);

			return d1(rows, currentLine);
		}

		function day17(input) {

			var go = function (input) {
				var pass = input.trim();
				var width = 4;
				var height = 4;
				var visited = {};

				var recur = function(state, x, y, res) {
					if( visited[state] || x < 0 || y < 0 || x >= width || y >= height )
						return;

					if( x == width - 1 && y == height - 1) {
						res.push(state);
						return;
					}

					visited[state] = true;
					var result = md5(pass + state);

					if( 'bcdef'.includes(result[0] ) ) {
						recur(state + 'U', x, y - 1, res);
					}
					if( 'bcdef'.includes(result[1] ) ) {
						recur(state + 'D', x, y + 1, res);
					}
					if( 'bcdef'.includes(result[2] ) ) {
						recur(state + 'L', x - 1, y, res);
					}
					if( 'bcdef'.includes(result[3] ) ) {
						recur(state + 'R', x + 1, y, res);
					}

					visited[state] = false;
				};
				var res = [];
				recur('', 0, 0, res);

				return res;
			};

			var d1 = function(input) {
				var res = go(input);
				var min = res[0];

				res.reduce((a,b)=> b.length < min.length ? min = b : b, '');

				return min;
			};

			var d2 = function(input) {
				var res = go(input);
				var max = res[0];

				res.reduce((a,b)=> b.length > max.length ? max = b : b, '');

				return max.length;
			};


			var testCases = [];
			testCases.push(createTestCase(d1, 'DDRRRD', "ihgpwlah"));
			testCases.push(createTestCase(d1, 'DDUDRLRRUDRD', "kglvqrro"));
			testCases.push(createTestCase(d1, 'DRURDRUDDLLDLUURRDULRLDUUDDDRR', "ulqzkmiv"));

			testCases.push(createTestCase(d2, 370, "ihgpwlah"));
			testCases.push(createTestCase(d2, 492, "kglvqrro"));
			testCases.push(createTestCase(d2, 830, "ulqzkmiv"));
			
			// runTests(testCases);

			return d2(input);
		}

		function day16(input) {
			//10101 too low;

			var a = input;
			var minLen = 35651584;
			var b = '';
			while(a.length < minLen) {
				a += '0' 
				+ a.split('').reverse().join('')
				.replace(/0/g, '#').replace(/1/g, '0').replace(/#/g, '1');
			}
			
			var checkSum = a.substr(0, minLen);
			while(checkSum.length % 2 == 0) {
				var newCheckSum = '';
				for(var i = 0; i < checkSum.length; i+=2) {
					if(checkSum[i] == checkSum[i+1])
						newCheckSum += 1;
					else 
						newCheckSum += 0;
				}

				checkSum = newCheckSum;
				console.log(checkSum);
			}

			return checkSum;
		}

		function day15(input) {
			var discs = {};
			var formulas = [];
			var lines = input.trim().split('\n');
			var reg = /.*#(\d+) has (\d+) positions.*position (\d+)\./;
			for(var i in lines) {
				var res = reg.exec(lines[i]);
				discs[res[1]] = {
					posCount: res[2],
					startPos: res[3]
				};
				(function(startIndex, positionsCount, index) {
					formulas.push(function(offset) {
						return (parseInt(startIndex) + parseInt(index)
							+ parseInt(offset)) % parseInt(positionsCount);
					});
				})(res[1], res[2], res[3]);
			}

			var i = 0;
			while(true) {
				var found = true;
				for(var j in formulas) {
					if(formulas[j](i) != 0) {
						found = false;
						break;
					}
				}
				if(found)
					return i;
				i++;
			}
		}

		function day14(input) {

			var has5 = function(md5, symbol) {
				return md5.indexOf('' + symbol + symbol + symbol + symbol + symbol) >= 0;
			};

			var has3 = function(md5) {
				var res = /(\w)\1\1/.exec(md5);

				if( res )
					return res[1];

				return false;
			};

			var last1000 = [];

			var addTo1000 = function(hash) {
				last1000.push(hash);

				if(last1000.length > 1000)
					last1000.shift();
			};

			var find5 = function(symbol) {
				for(var i = 1; i < last1000.length; i++) {
					if(has5(last1000[i], symbol))
						return last1000[i];
				}

				return false;
			}

			var keys = 0;
			//the 5 symbol hash may cover more than one 3 symbol hashe
			var checkForKeys = function(hash) {
				if(last1000.length < 1000)
					return false;

				var symbol = has3(last1000[0]);
				if(symbol && find5(symbol)) {
					last1000.shift();
					keys++;
					return keys;
				}

				return false;
			};

			var getHash_1 = function(input) {
				return md5(input);
			};

			var getHash_2 = function(input) {
				var res = input;
				for(var i = 0; i <= 2016; i++) {
					res = md5(res);
				}
				return res;
			};

			var testCases = [];

			testCases.push(createTestCase(has3, 3, "11 333 22"));
			testCases.push(createTestCase(has3, false, "11 33 22"));
			testCases.push(createTestCase(has3, 1, "11332322 11111 2"));
			testCases.push(createTestCase(has3, 1, "11111 33333"));

			testCases.push(createTestCase(has5, false, "11 3333 22", 3));
			testCases.push(createTestCase(has5, true , "11 33333 22", 3));
			testCases.push(createTestCase(has5, false, "11 33333 22", 2));
			testCases.push(createTestCase(has5, false, "11 33 333 22",  3));
			testCases.push(createTestCase(has5, true , "11332322 11111 2", 1));
			testCases.push(createTestCase(has5, false, "11 33 3 22 111 2", 3));

			testCases.push(createTestCase(getHash_2, 'a107ff634856bb300138cac6568c0f24', "abc0"));

			runTests(testCases);

			var salt = input.trim();
			var res = '';
			var i = 0;
			var t = (new Date()).getTime();
			while(i++ < 100000) {
				var stream = getHash_1(salt + '' + i);
				addTo1000(stream);
				if(checkForKeys()) {
					res += (i - 999) + ', '
				}

				if(keys == 64) {
					console.log('Finished in: ' + ((new Date()).getTime() - t) / 1000 + ' seconds');
					console.log('Result: ' + res);
					return i - 999;	
				}
			}

			return false;
		}
		
		function day13(input) {
			input = 1358;
			var destX = 51;
			var destY = 51;

			var isOpenSpace = function(x, y) {
				var res = x * x + 3 * x + 2 * x * y + y + y * y;
				res += input;
				res = (res >>> 0).toString(2);
				res = res.match(/1/g).length;
				return res % 2 == 0;
			};

			var arr = [];
			var visited = [];
			for (var y = 0; y < destX; y++) {
				arr.push([]);
				visited.push([]);
				for(var x = 0; x < destY; x++) {
					arr[y].push(isOpenSpace(x, y) ? '_' : 'X');
					visited[y].push(false);
				}
			}

			var DFS = function(arr, x, y) {
				var q = [{x: 1, y: 1, len: 0, path: ['1, 1']}];

				var canVisit = function(x, y) {
					if(x < 0 || y < 0)
						return false;

					if( arr[y] == undefined ) {
						arr[y] = [];
					}

					if( arr[y][x] == undefined ) {
						arr[y][x] = isOpenSpace(x, y) ? '_' : 'X';
					}

					return arr[y][x] == '_';
				};

				while(q.length > 0) {
					var item = q.shift();
					//console.log(item.y + ', ' + item.x + '; ' + item.len + ' -- ' + item.path.join('; '));

					//uncomment for day 1;
					// if( item.x == x && item.y == y ) {
					// 	console.log(item);
					// 	return item.len + ' ' + item.path;
					// }
					//--------------------------

					for(i = -1; i <= 1; i++) {
						for(j = -1; j <= 1; j++) {
							if( i != j && i * j == 0 &&
								canVisit(item.x + i, item.y + j) ) {
								//remove for day 1:
								if(item.len == 50 ) continue;
								//------------------

								//remove for day 1:
								arr[item.y + j][item.x + i] = '<span style="color: red;">$</span>';
								//------------------
								var path = item.path.slice(0);
								path.push(item.y + j + ', ' + item.x + i);
								q.push({x: item.x + i, y: item.y + j, len: item.len + 1, path: path});
							}
						}
					}
				}

				var c = 0;
				for(var i in arr) {
					for(var j in arr[i])
						if(arr[i][j].length > 10) c++;
				}

				//121 - too low
				//return printMatrix(arr, '#', '_');
				return c;
			};


			return DFS(arr, destX, destY);
		}

		function day12(input) {
			//2 - too low
			var registers = { a: 0, b: 0, c: 1, d: 0 };
			var currentInstr = 0;
			var instructions = input.split('\n');

			var jumpTo = function(instr) {
				currentInstr += instr;
			};

			var resolveArg = function(arg) {
				if(isNaN(arg))
					return registers[arg];

				return parseInt(arg);
			};

			var lastd = 0;

			var ops = {
				cpy: function( x, y ) {
					registers[y] = resolveArg(x);
					jumpTo(1);
				},
				inc: function(x) {
					registers[x] += 1;
					jumpTo(1);
				},
				dec: function(x) {
					registers[x] -= 1;
					jumpTo(1);
				},
				jnz: function(x, y) {
					if( resolveArg(x) != 0 ) {
						jumpTo(parseInt(y));
					} else {
						jumpTo(1);
					}
				}
			};

			var reg = /(\w{3}) (\w+) *(-*\w*)/;
			while( currentInstr < instructions.length ) {
				var res = reg.exec(instructions[currentInstr]);
				var name = res[1];
				var args = res.splice(2);
				ops[name].apply(null, args);
			}

			return registers.a;
		}

		function day11(input) {
			var getInitialState = function(input) {

				var lines = input.split('\n');
				var generators = {};
				var microchips = {};
				var generatorRegex = /(\w+) generator/g;
				var microchipRegex = /(\w+)-compatible microchip/g;
				for(var i = 0; i < lines.length; i++) {
					var res
					while(res = generatorRegex.exec(lines[i])) {
						generators[res[1]] = i + 1;
					}
					while(res = microchipRegex.exec(lines[i])) {
						microchips[res[1]] = i + 1;
					}
				}

				var hash = '1';

				for(var i in microchips) {
					hash += microchips[i] + '' + generators[i];
				}

				return {
					floor: 1,
					hash: sortHash(hash),
					len: 0,
					prevState: null
				};
			}

			var isStateFinal = function(stateHash) {
				return stateHash.startsWith("444");
			}

			var isStateValid = function(stateHash) {

				var generators = [0,0,0,0];
				var microchips = [0,0,0,0];
				for(var i = 1; i < stateHash.length; i += 2) {
					//count all generators
					generators[stateHash[i+1]]++;

					//count unprotected chips
					if(stateHash[i] != stateHash[i+1]) {
						microchips[stateHash[i]]++;
					}
				}

				for(var i = 0; i < generators.length; i++) {
					if( generators[i] > 0 && microchips[i] > 0 )
						return false;
				}

				return true;
			}

			var testCases = {};

			var sortHash = function(hash) {

				var parts = hash.substr(1).match(/.{2}/g);

				parts.sort( function(a, b) {
					if(a[0] == b[0])
						return a.charCodeAt(1) - b.charCodeAt(1);

					return a.charCodeAt(0) - b.charCodeAt(0);
				} );

				return hash[0] + parts.join('');
			};

			var getAllStateMutations = function(stateHash) {
				var states = [];

				var currentFloor = parseInt(stateHash[0]);
				for(var f = currentFloor + 1; f >= currentFloor - 1; f -= 2) {
					if( f < 1 || f > 4) continue;

					for(var i = 1; i < stateHash.length; i++) {
						if(stateHash[i] != currentFloor) continue;

						var newState = sortHash(f + stateHash.substr(1, i - 1) + f + stateHash.substr(i + 1));
						if( isStateValid(newState) && !prevStates[newState] )
							states.push(newState);

						for(var j = i + 1; j < stateHash.length; j++) {
							if(newState[j] != currentFloor) continue;

							var newState2 = sortHash(f + newState.substr(1, j - 1) + f + newState.substr(j + 1));
							if( isStateValid(newState2) && !prevStates[newState2] )
								states.push(newState2);
						}

					}
				}

				return states;
			}

			// createTestCase(isStateFinal, false, "4232344");
			// createTestCase(isStateFinal, false, "442");
			// createTestCase(isStateFinal, true , "44444");
			// createTestCase(isStateFinal, false, "3122233");
			// createTestCase(isStateFinal, false, "4112233");

			// createTestCase(isStateValid, false, "_1112");
			// createTestCase(isStateValid, true,  "_1121");
			// createTestCase(isStateValid, true,  "_1222");
			// createTestCase(isStateValid, false, "_2122");

			// createTestCase(getAllStateMutations, false, "11111222232");

			// createTestCase(sortHash, "11111222232", "11111222232");
			// createTestCase(sortHash, "11122223244", "14411222232");
			// createTestCase(sortHash, "11121222232", "12111222232");

			// console.log(testCases);
			runTests();

			var state = getInitialState(input);
			var q = [state];
			var prevStates = {};
			prevStates[state.hash] = state;

			while(q.length > 0) {
				var state = q.shift();
				if(isStateFinal(state.hash)) {
					console.log(state);
					return;
				}

				var newStates = getAllStateMutations(state.hash);
				for(var i in newStates) {
					prevStates[newStates[i]] = true;
					q.push({
						hash: newStates[i],
						len: state.len + 1,
						prevState: state
					});
				}
			}
		}

		function day10_(input) {

			var bots = {};
			for(var i = 0; i <= 209; i++) bots[i] = [];
			var bins = {};
			for(var i = 0; i <= 20 ; i++) bins[i] = [];
			var commands = {};
			var index = 0;
			var instrBotToBot = /bot (\d+) gives low to (\w+) (\d+) and high to (\w+) (\d+)/;
			var instrValueToBot = /value (\d+) goes to bot (\d+)/;
			var lines = input.split('\n');
			var regRes;
			var res = '';

			for(var i in lines) {
				regRes = instrBotToBot.exec( lines[i].trim() );
				if( regRes ) {

					var recip1 = regRes[2] == 'bot' ? bots[regRes[3]] : bins[regRes[3]];
					var recip2 = regRes[4] == 'bot' ? bots[regRes[5]] : bins[regRes[5]];
					var bot = bots[regRes[1]];
					var a = function (bot, recip1, recip2, debugInfo) {
						return function() {
							recip1.push(Math.min(parseInt(bot[0]), parseInt(bot[1])));
							recip2.push(Math.max(parseInt(bot[0]), parseInt(bot[1])));
							//console.log(bot);


							if(bot[0] == 17 && bot[1] == 61 || bot[0] == 61 && bot[1] == 17)
								//console.log(debugInfo)
							bot.splice(0, 2);
						};
					};

					commands[regRes[1]] = a(bot, recip1, recip2,
						JSON.parse(JSON.stringify(regRes)));
				}
				else {
					regRes = instrValueToBot.exec( lines[i].trim() );
					if( !bots[regRes[2]] )
						bots[regRes[2]] = [];
					
					bots[regRes[2]].push(parseInt(regRes[1]));
				}
			}

			while(Object.keys(commands).length) {
				for(var i in bots) {
					if(bots[i].length == 2 && commands[i]) {
						commands[i]();	
						delete commands[i];
						break;
					}
				}
			}
			console.log( bins );
			return false;
		}

		function day10(input) {

			var bots = {};
			for(var i = 0; i <= 209; i++) bots[i] = [];
			var bins = {};
			for(var i = 0; i <= 20 ; i++) bins[i] = [];
			var commands = {};
			var index = 0;
			var instrBotToBot = /bot (\d+) gives low to (\w+) (\d+) and high to (\w+) (\d+)/;
			var instrValueToBot = /value (\d+) goes to bot (\d+)/;
			var lines = input.split('\n');
			var regRes;
			var res = '';

			for(var i in lines) {
				regRes = instrBotToBot.exec( lines[i].trim() );
				if( regRes ) {

					var recip1 = regRes[2] == 'bot' ? bots[regRes[3]] : bins[regRes[3]];
					var recip2 = regRes[4] == 'bot' ? bots[regRes[5]] : bins[regRes[5]];
					var bot = bots[regRes[1]];
					var a = function (bot, recip1, recip2, debugInfo) {
						return function() {
							recip1.push(Math.min(parseInt(bot[0]), parseInt(bot[1])));
							recip2.push(Math.max(parseInt(bot[0]), parseInt(bot[1])));
							//console.log(bot);


							if(bot[0] == 17 && bot[1] == 61 || bot[0] == 61 && bot[1] == 17)
								console.log(debugInfo)
							bot.splice(0, 2);
						};
					};

					commands[regRes[1]] = a(bot, recip1, recip2,
						JSON.parse(JSON.stringify(regRes)));
				}
				else {
					regRes = instrValueToBot.exec( lines[i].trim() );
					if( !bots[regRes[2]] )
						bots[regRes[2]] = [];
					
					bots[regRes[2]].push(parseInt(regRes[1]));
				}
			}

			while(Object.keys(commands).length) {
				for(var i in bots) {
					if(bots[i].length == 2 && commands[i]) {
						commands[i]();	
						delete commands[i];
						break;
					}
				}
			}
			return res;
		}

		function day9_(input) {
			/*
			(3x3)XYZ
			X(8x2)(3x3)ABCY
			(27x12)(20x12)(13x14)(7x10)(1x12)A
			(25x3)(3x3)ABC(2x3)XY(5x2)PQRSTX(18x9)(3x2)TWO(5x7)SEVEN
			*/
			var decompressLen = function(text) {
				var reg = /(.*?)\((\d+)x(\d+)\)(.*)/;
				var res = reg.exec(text);
				if( !res ) {
					return text.length;
				}
				var symbolsC  = parseInt(res[2]);
				var repeatC   = parseInt(res[3]);
				var substr    = res[4].substr(0, symbolsC);
				var decompLen = repeatC * decompressLen(substr);
				
				return res[1].length + decompLen + decompressLen(res[4].substr(symbolsC));
			};

			var lines = input.split('\n');
			var res = '';
			for(var i in lines) {
				res += decompressLen(lines[i].trim()) + '<br>';
			}

			return res;
		}

		function day9(input) {
			/*
			ADVENT
			A(1x5)BC
			(3x3)XYZ
			A(2x2)BCD(2x2)EFG
			(6x1)(1x3)A
			X(8x2)(3x3)ABCY
			*/
			var decompress = function(text) {
				var reg = /(.*?)\((\d+)x(\d+)\)(.*)/;
				var res = reg.exec(text);
				if( !res ) {
					return text;
				}
				var symbolsC = parseInt(res[2]);
				var repeatC  = parseInt(res[3]);
				var substr = res[4].substr(0, symbolsC);
				decomp = substr;
				for(var i = 1; i < repeatC; i++) {
					decomp += substr;
				}

				return res[1] + decomp + decompress(res[4].substr(symbolsC));
			};

			var lines = input.split('\n');
			var res = '';
			for(var i in lines) {
				res += decompress(lines[i].trim());
			}

			return res.length;
		}

		function day8(input) {
		/*
rect 3x2
rotate column x=1 by 1
rotate row y=0 by 4
rotate column x=1 by 1
		*/
			var width = 50;
			var height = 6;
			var lines = input.split('\n');

			var matrix = Array.apply(null, Array(height)).map(() => Array.apply(null, Array(width)).map(()=>false));

			var rotateArray = function(arr, amount) {
				for(var i = 0; i < amount; i++) {
					arr.unshift(arr.pop());
				}
			};

			var rectangle = function(matrix, x, y) {
				for(var i = 0; i < y; i++)
					for(var j = 0; j < x; j++)
						matrix[i][j] = true;
			};

			var rotateRow = function(matrix, row, amount) {
				rotateArray(matrix[row], amount % width);
			};

			var rotateCol = function(matrix, col, amount) {
				var arr = [];
				for(var i = 0; i < height; i++)
					arr.push(matrix[i][col]);

				rotateArray(arr, amount % height);

				for(var i = 0; i < height; i++)
					matrix[i][col] = arr[i];
			};

			var rotateRowReg = /rotate\srow\sy=(\d+)\sby\s(\d+)/;
			var rotateColReg = /rotate\scolumn\sx=(\d+)\sby\s(\d+)/;
			var rectReg = /rect\s(\d+)x(\d+)/;
			var res;
			var output = '';

			for( var i in lines ) {
				if( res = rectReg.exec(lines[i]) )
					rectangle( matrix, res[1], res[2] );
				else if( res = rotateRowReg.exec(lines[i]) )
					rotateRow( matrix, res[1], res[2] );
				else if( res = rotateColReg.exec(lines[i]) )
					rotateCol( matrix, res[1], res[2] );

				output +=  printMatrix(matrix, '') + '<br><br>\n\n';
				console.log('\n\n\n');
				console.log(output);
			}

			return output;
		}
		
		function day7__(input) {
			 const [supernet, hypernet] = [0, 1].map(mod =>
		        ip => ip.split(/\[(.+?)\]/g).filter((_, i) => i % 2 === mod).join('-'));
		    const matchAll = function* (re, s, m = re.exec(s)) {
		        if (m === null) return;
		        yield m[0];
		        re.lastIndex -= m[0].length - 1;
		        yield* matchAll(re, s);
		    };
		    input = input.split('\n');
		    const 
		        abbas = s => s.match(/(.)((?!\1).)\2\1/g) || [],
		        abas = s => [...matchAll(/(.)(?!\1).(?=\1)/g, s)],
		        hasTLS = ip => abbas(supernet(ip)).length > 0 && abbas(hypernet(ip)).length === 0,
		        hasSSL = ip => abas(supernet(ip)).some(s => abas(hypernet(ip)).includes(s[1] + s[0]));

		    console.log(...[hasTLS, hasSSL].map(f => input.filter(f).length));

		}
		
		function day7_(input)
		{
			/*
			242

			aba[bab]xyz
			xyx[xyx]xyx
			aaa[kek]eke
			zazbz[bzb]cdb
			*/
			var totalCount = 0;
			var abasFound = 0;
			var lines = input.split('\n');
			for(var i in lines) {
				var line = lines[i].trim();

				var res = /(\w)(\w)\1.*\2\1\2/.exec(line);
				if(!res)
				{
					continue;
				}

				abasFound++;
				line = line.replace("[", "]").split("]");
				var aba = res[1] + res[2] + res[1];
				var bab = res[2] + res[1] + res[2];

				var hasOddAba = false;
				var hasEvenAba = false;
				var hasOddBab = false;
				var hasEvenBab = false;
				for(var j in line) {
					if( line[j].indexOf(aba) > 0) {
						if( j % 2 == 0) hasEvenAba = true;
						else hasOddAba = true;
					}

					if( line[j].indexOf(bab) > 0) {
						if( j % 2 == 0) hasEvenBab = true;
						else hasOddBab = true;
					}
				}

				if( hasEvenBab && hasOddAba ||
					hasOddBab && hasEvenAba) totalCount++
			}

			return "ABAs: " + abasFound + ', total: ' + totalCount;
		}

		function day7(input)
		{
			/*
			abba[mnop]qrst
			abcd[bddb]xyyx
			aaaa[qwer]tyui
			ioxxoj[asdfgh]zxcvbn
			*/

			var totalCount = 0;
			var lines = input.split('\n');
			for(var i in lines) {
				var line = lines[i];
				var res = /\[[^\]]*(.)(.)\2\1/.exec(line);
				if(res && res.length > 0)
				{
					console.log('Incompatible: ' + line + '   ' + res);
					continue;
				}
				
				res = /(.)(.)\2\1/.exec(line);
				if(res && res.length > 0 && res[1] != res[2]) {
					console.log('Compatible: ' + line + '   ' + res);
					totalCount++;
				}
			}

			return totalCount;
		}

		function day6_(input)
		{
			var bucket = [{},{},{},{},{},{},{},{}];
			var lines = input.split('\n');
			for(var i in lines) {
				line = lines[i];
				for(var j = 0; j < line.length; j++) {
					if(!bucket[j][line[j]])
						bucket[j][line[j]] = 1;
					else
						bucket[j][line[j]]++;
				}
			}

			var word = '';
			for(var i in bucket) {
				var min = 10000000000;
				var minJ = '';
				for(var j in bucket[i]) {
					if(bucket[i][j] < min) {
						min = bucket[i][j];
						minJ = j;
					}
				}
				word += minJ;
			}

			return word;
		}

		function day6(input)
		{
			var bucket = [{},{},{},{},{},{},{},{}];
			var lines = input.split('\n');
			for(var i in lines) {
				line = lines[i];
				for(var j = 0; j < line.length; j++) {
					if(!bucket[j][line[j]])
						bucket[j][line[j]] = 1;
					else
						bucket[j][line[j]]++;
				}
			}

			var word = '';
			for(var i in bucket) {
				var max = 0;
				var maxJ = '';
				for(var j in bucket[i]) {
					if(bucket[i][j] > max) {
						max = bucket[i][j];
						maxJ = j;
					}
				}
				word += maxJ;
			}

			return word;
		}

		function day5_(input, update)
		{
			String.prototype.replaceAt = function(index, character) {
	    	return this.substr(0, index) + character + this.substr(index + character.length);
		}
			// input = 'ffykfhsq';
			var pass = '________';
			var counter = 0;
			var i = 0;
			while(true)
			{
				i++;
				var h = md5(input + i);
				if(h.startsWith('00000'))
				{
					var pos = parseInt(h.charAt(5));
					if( pos < 8 && pass.charAt(pos) == '_') {
						counter++;
						pass = pass.replaceAt(pos, h.charAt(6));
						console.log(pass);

						if( counter == 8 )
							break;
					}
				}
			}

			return pass;
		}

		function day5(input)
		{
			// input = 'ffykfhsq';
			var pass = '';
			var i = 0;
			while(true)
			{
				i++;
				var h = md5(input + i)
				if(h.startsWith('00000'))
				{
					pass+=h.charAt(5);
					console.log(pass);

					if( pass.length == 8 )
						break;
				}
			}

			return pass;
		}

		function day4_(input)
		{
			var lines = input.split('\n');

			var calcHash = function(name) {
				var dict = {};
				for(var i in name) {
					if( !dict[name[i]] ) {
						dict[name[i]] = 1;
					} else {
						dict[name[i]]++;
					}
				}
				var arr = [];
				for(var i in dict) {
					arr.push({key:i, value:dict[i]});
				}

				arr.sort(function(a, b) {
					if( a.value == b.value )
						return a.key.charCodeAt(0) - b.key.charCodeAt(0);

					return b.value - a.value;
				});

				var h = '';
				for(var i = 0; i < 5; i++) {
					h += arr[i].key;
				}

				return h;
			};

			var decrypt = function(name, sector) {
				var rotation = sector % 26;
				var newName = '';
				for(var i in name) {
					if(name[i] == '-')
						newName += ' ';
					else 
						newName += String.fromCharCode((name.charCodeAt(i) - 97 + rotation) % 26 + 97)
				}

				return newName;
			};

			var roomNames = '';
			for(var i in lines) {
				var line = lines[i].split(' ');
				var name = line[0];
				var sector = line[1];
				var hash = line[2];

				if( calcHash(name) == hash || true ) {
					roomNames += decrypt(name, sector) + ' ' + sector + '\n<br>';
				}
			}

			return roomNames;
		}

		function day4(input)
		{
			var lines = input.split('\n');

			var calcHash = function(name) {
				var dict = {};
				for(var i in name) {
					if( !dict[name[i]] ) {
						dict[name[i]] = 1;
					} else {
						dict[name[i]]++;
					}
				}
				var arr = [];
				for(var i in dict) {
					arr.push({key:i, value:dict[i]});
				}

				arr.sort(function(a, b) {
					if( a.value == b.value )
						return a.key.charCodeAt(0) - b.key.charCodeAt(0);

					return b.value - a.value;
				});

				var h = '';
				for(var i = 0; i < 5; i++) {
					h += arr[i].key;
				}

				return h;
			};

			var sector = 0;
			for(var i in lines) {
				var line = lines[i].split(' ');
				var name = line[0];
				var hash = line[2];

				if( calcHash(name) == hash ) {
					sector += parseInt(line[1]);					
				}
			}

			return sector;
		}

		function day3_(input)
		{

			var lines = input.split('\n');
			var possible = 0;
			var arr = [];
			var nums =[[0, 0, 0], [0, 0, 0], [0, 0, 0]];
			var counter = 0;

			for(var i in lines) {
				var line = lines[i].trim().split(' ');

				nums[0][counter] = parseInt(line[0].trim());
				nums[1][counter] = parseInt(line[1].trim());
				nums[2][counter] = parseInt(line[2].trim());

				counter++;
				if(counter == 3) {
					counter = 0;
					for(var j = 0; j < 3; j++) {
						if( nums[j][0] + nums[j][1] > nums[j][2] &&
							nums[j][0] + nums[j][2] > nums[j][1] &&
							nums[j][1] + nums[j][2] > nums[j][0])
						possible++;
					}					
				}
			}


			return possible;
		}

		function day3(input)
		{

			var lines = input.split('\n');
			var possible = 0;

			for(var i in lines) {
				var nums = lines[i].trim().split(' ');
				var a = parseInt(nums[0].trim());
				var b = parseInt(nums[1].trim());
				var c = parseInt(nums[2].trim());
				if( a + b > c &&
					a + c > b &&
					b + c > a)
					possible++;
			}

			return possible;
		}

		function day2_(input)
		{
			var moveMap = [[0, 0, 0, 0, 0, 0, 0],
						   [0, 0, 0, 1, 0, 0, 0],
						   [0, 0, 1, 1, 1, 0, 0],
						   [0, 1, 1, 1, 1, 1, 0],
						   [0, 0, 1, 1, 1, 0, 0],
						   [0, 0, 0, 1, 0, 0, 0],
						   [0, 0, 0, 0, 0, 0, 0]];

			var move = function(current, direction) {

				switch(direction)
				{
					case 'U': if( moveMap[current.Y - 1][current.X])
									current.Y--;
								break;
					case 'D': if( moveMap[current.Y + 1][current.X])
									current.Y++;
								break;
					case 'L': if( moveMap[current.Y][current.X - 1])
									current.X--;
								break;
					case 'R': if( moveMap[current.Y][current.X + 1])
									current.X++;
								break;
				}
			}

			var lines = input.split('\n');
			var keypad =   [[0, 0,    1,   0, 0],
							[0, 2,    3,   4, 0],
							[5, 6,    7,   8, 9],
							[0, 'A', 'B', 'C', 0],
							[0, 0,   'D',  0, 0]];
			var location = {X:1, Y:3};
			var pass = "";

			for(var i in lines) {
				for(var j in lines[i]) {
					move(location, lines[i][j]);
				}

				pass += keypad[location.Y - 1][location.X - 1];
			}

			return pass;
		}

		function day2(input)
		{
			var move = function(current, direction) {

				switch(direction)
				{
					case 'U': if( current.Y > 0) current.Y--; break
					case 'D': if( current.Y < 2) current.Y++; break
					case 'L': if( current.X > 0) current.X--; break
					case 'R': if( current.X < 2) current.X++; break
				}
			}

			var lines = input.split('\n');
			var keypad =   [[1,2,3],
							[4,5,6],
							[7,8,9]];
			var location = {X:1, Y:1};
			var pass = "";

			for(var i in lines) {
				for(var j in lines[i]) {
					move(location, lines[i][j]);
					console.log(keypad[location.Y][location.X]);
				}

				pass += keypad[location.Y][location.X];
			}

			return pass;
		}

		function day1_(input)
		{
			var getNewDir = function(currentLocation, newDirection)
			{
				var directions = {
					N: {L: 'W', R: 'E'},
					W: {L: 'S', R: 'N'},
					S: {L: 'E', R: 'W'},
					E: {L: 'N', R: 'S'}
				}

				return directions[currentLocation.D][newDirection[0]];
			}

			var traverse = function(location, newDirection, distance)
			{
				location.D = newDirection;
				var func;
				switch(newDir)
				{
					case 'N':
						func = function(loc) {loc.Y--};
						break;
					case 'W':
					func = function(loc) {loc.X--};
						break;
					case 'S':
						func = function(loc) {loc.Y++};
						break;
					case 'E':
						func = function(loc) {loc.X++};
						break;
				}
				for(var i = 0; i < distance; i++)
				{
					func(location);
					if( pastLocations[location.X + ":" + location.Y] )
					{
						return Math.abs(location.X) + Math.abs(location.Y);
					}

					pastLocations[location.X + ":" + location.Y] = true;
				}

				return false;
			}

			var directions = input.split(', ');
			var location = {X:0, Y:0, D:'N'};
			var pastLocations = {"0:0": true};
			var currentDir = 'N';
			var ret = false;
			for(var i in directions) {
				
				var newDir = getNewDir(location, directions[i]);
				if(ret = traverse(location, newDir, parseInt(directions[i].substr(1))))
				{
					return ret;
				}
			}

			return "error";
		}

		function day1(input)
		{
			var directions = input.split(', ');
			var dirs = { N:0, W:0, E:0, S:0 };
			var changeDir = function(currentDir, direction)
			{
				var directions = {
					N: {L: 'W', R: 'E'},
					W: {L: 'S', R: 'N'},
					S: {L: 'E', R: 'W'},
					E: {L: 'N', R: 'S'}
				}

				return directions[currentDir][direction];
			}

			var currentDir = 'N';
			for(var i in directions) {
				var d = directions[i];
				var currentDir = changeDir(currentDir, d[0]);
				dirs[currentDir] += parseInt(d.substr(1));
			}

			return Math.abs(dirs.E - dirs.W) + Math.abs(dirs.S - dirs.N)
		}