# The Coding Format of the Future

run

```javascript
node index.mjs INPUT_DIR OUTPUT_DIR
```

INPUT_DIR defaults to "./code"
and OUTPUT_DIR defaults to "./transposed"

INPUT_DIR and OUTPUT_DIR must be directories. Subdirectories are also scanned, their files are transposed, and then the sub-structure is copied to the output directory.

If INPUT_DIR does not exist the program will abort ungracefully with an exception...

