export function titleCase(str: string){
    return str.split(' ').map((c, i) => {
        return i === 0 ? c.toUpperCase() : c
    }).join('')
}