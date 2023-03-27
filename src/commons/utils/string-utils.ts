export const stringToUpperUnderscored = (input: string) => {
  return input?.toUpperCase().replace(/ +/g, '_')
}
