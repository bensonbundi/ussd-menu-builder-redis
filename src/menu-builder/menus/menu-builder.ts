export default function(displayState, stateText, stateVariables, inputPrefix = ''){

    let response = "";
    let stateTextVariable = "";
    let stateTextStatic = "";
    

    if(displayState.type === 'count'){
        console.log('ITS COUNT');
        
        const menuOptions = displayState.menu_options.filter(el => el.active === true)
        const menuOptionsTextArr = menuOptions.map((el, i) => {
            return (stateText.menu_options[el.id]).replace("%c", i+1)
        })

        const menuOptionsText = menuOptionsTextArr.join("")

        stateTextVariable = stateText.variable.replace("%d", menuOptionsText)
        stateTextStatic = stateText.static.replace("%d", menuOptionsText)

        // INJECT VARIABLES
        Object.entries(stateVariables).forEach(([key, val]) => {
            console.log(`%${key}`);
            
            stateTextVariable = stateTextVariable.replace(`%${key}`, `${val}`)
            stateTextStatic = stateTextStatic.replace(`%${key}`, `${val}`)
        })
            
    } else if(displayState.type === 'entry') {

        stateTextVariable = stateText.variable;

        // INJECT VARIABLES
        Object.entries(stateVariables).forEach(([key, val]) => {
            console.log(`%${key}`);
            
            stateTextVariable = stateTextVariable.replace(`%${key}`, `${val}`)
        })
    }


    // TODO IMPLEMENT PAGINATION

    return inputPrefix + stateTextVariable + stateTextStatic
}