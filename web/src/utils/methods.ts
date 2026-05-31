export const RemoveSfromName = (str:string) => {
    if (str.endsWith('s')) {
      return str.slice(0,-1)
    } else {
      return str
    }
  }