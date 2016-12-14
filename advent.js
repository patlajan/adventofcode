String.prototype.replaceAt = function(index, character) {
	    	return this.substr(0, index) + character + this.substr(index + character.length);
		}

		var div = document.getElementById("div");
		var input = document.getElementById("input");
		div.innerHTML = "asd";
		
		function printMatrix(matrix, emptySymbol = ' ', fullSymbol = '#' ) {
			var str = '';
			var count = 0;
			for(var i in matrix) {
				for(var j in matrix[i]) {
					if( matrix[i][j] === true ) {
						count++;
						str += fullSymbol;
					}
					else if( matrix[i][j] === false ){
						str += emptySymbol;
					}
					else {
						str += matrix[i][j];
					}
				}

				str += '<br>\n';
			}

			return str + 'Count: ' + count + '<br>\n';
		}

		var createTestCase = function(method, expectedOutput, inputParams) {
			return {
				method: method,
				expectedOutput: expectedOutput,
				arguments: Array.prototype.slice.call(arguments, 2)
			};
		}

		var runTests = function(testCases) {
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

		// window.onload = () => refresh({value: input.value});

		function refresh(e) {
			div.innerHTML = day14(e.value);
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