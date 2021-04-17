function begin(args) {

  const { param = 'input' } = args
  console.log(`${param} test`)

}

begin({ param: 'default' })
