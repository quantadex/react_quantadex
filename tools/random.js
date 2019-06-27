var buf = new Buffer(10001);

for (var i=0;i<10001;i++) {
	const r = Math.floor(Math.random() * 100) + 1;
	buf.writeUInt8(r, i);
}

console.log(buf.toString())

/*
JAVASCRIPT RANDOM

Entropy = 6.636445 bits per byte.

Optimum compression would reduce the size
of this 10002 byte file by 17 percent.

Chi square distribution for 10002 samples is 15868.59, and randomly
would exceed this value less than 0.01 percent of the times.

Arithmetic mean value of data bytes is 50.8445 (127.5 = random).
Monte Carlo value for Pi is 4.000000000 (error 27.32 percent).
Serial correlation coefficient is 0.008270 (totally uncorrelated = 0.0).
*/


/*
ROLLS.BIN

Entropy = 1.124589 bits per byte.

Optimum compression would reduce the size
of this 10002 byte file by 85 percent.

Chi square distribution for 10002 samples is 2063931.65, and randomly
would exceed this value less than 0.01 percent of the times.

Arithmetic mean value of data bytes is 4.8437 (127.5 = random).
Monte Carlo value for Pi is 4.000000000 (error 27.32 percent).
Serial correlation coefficient is 0.708554 (totally uncorrelated = 0.0).

*/