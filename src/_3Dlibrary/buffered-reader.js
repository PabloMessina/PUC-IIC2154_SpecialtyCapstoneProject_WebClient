/**
 *  A helper object to read line by line in a buffered fashion.
 */
const BufferedReader = {
  /**
   * @file
   *    the file to read from
   * @chunkSize
   *    the number of bytes to read from the file each time
   * @callback is the client callback function that gets called
   *    every time something important happens.
   *    It will be passed on 3 arguments: [line, error, eof]
   *    The client must check whether error or eof are null or not
   *    before reading the lineF
   */
  readLineByLine: (file, chunkSize, callback) => {
    const fr = new FileReader();
    let offset = 0;
    let line = '';

    // function called in every successful read
    fr.onload = () => {
      const result = fr.result;
      let start = 0;
      let end;
      while (true) {
        end = -1;
        for (let i = start; i < result.length; ++i) {
          const char = result[i];
          if (char === '\n' || char === '\r') {
            end = i;
            break;
          }
        }
        if (end === -1) {
          line += result.substring(start);
          offset += result.length;
          break;
        } else {
          line += result.substring(start, end);
          if (line !== '') callback(line, null, null); // line found
          line = ''; // reset line
          start = end + 1;
        }
      }
      readNextChunk();
    };

    // function called when an error is raised
    fr.onerror = (err) => {
      callback(null, err, false);
    };

    // function to read by chunks
    function readNextChunk() {
      // check we are still within the limits
      if (offset >= file.size) {
        callback(null, null, true); // EOF detected
        return;
      }
      // read next slice
      const slice = file.slice(offset, offset + chunkSize);
      fr.readAsText(slice);
    }

    // start reading
    readNextChunk();
  },
};

export default BufferedReader;
