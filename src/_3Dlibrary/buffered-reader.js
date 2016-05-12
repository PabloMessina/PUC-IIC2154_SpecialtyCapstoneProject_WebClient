/**
 *  A helper object to read line by line in a buffered fashion.
 */
const BufferedReader = {
  /**
   * [reads file internally chunk by chunk, and notifies client code about every line
   * detected along the way and the amount of filed consumed so far (pogress) for every chunk]
   * @param  {[FILE]} file
   * @param  {[float]} chunkSize
   * @param  {[function]} lineDetectedcallback [(line, error, eof)]
   * @param  {[function]} progressCallback     [(lengthSoFar, totalLength)]
   */
  readLineByLine: (file, chunkSize, lineDetectedCallback, progressCallback) => {
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
          if (line !== '') lineDetectedCallback(line, null, false); // line found
          line = ''; // reset line
          start = end + 1;
        }
      }
      progressCallback(offset, file.size); // notify progress
      readNextChunk();
    };

    // function called when an error is raised
    fr.onerror = (err) => {
      lineDetectedCallback(null, err, false);
    };

    // function to read by chunks
    function readNextChunk() {
      // check we are still within the limits
      if (offset >= file.size) {
        lineDetectedCallback(null, null, true); // EOF detected
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
