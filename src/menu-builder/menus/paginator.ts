export function paginator(menu_variable, menu_static){

    //strip out cc - character count title + `\ncc: ${title.length}` 
    menu_variable = menu_variable.replace(/\ncc: \d+/g,'');
    // GET FULL TEXT AND CHECK IF ITS GREATER THAN 120
    const full_text = menu_variable + menu_static
    if(full_text.length > 120){

        const menu_variable_arr = menu_variable.split("\n");
        const menu_variable_arr_len = menu_variable_arr.length;

        const next = "33 Next";
        const prev = "44 Prev";

        // THIS IS WHERE THE paginated blocks are
        let blocks = [""]
        let block_pos = 0;

        menu_variable_arr.forEach((el, i) => {

            const block_pos_len = blocks[block_pos].length
            const el_len = el.length + 1;
            let postfix = "";
            let postfix_len = 0;

            // FOR THE 1ST BLOCK
            if(block_pos === 0){
                postfix = "\n"+ next + menu_static 
                postfix_len = postfix.length 
            }else{
            // OTHER CONSECUTIVE BLOCKS
                postfix = "\n" + prev + "\n" + next + menu_static 
                postfix_len = postfix.length
            }

            // IF BLOCK IS NOT FULL KEEP ADDING ELEMENTS
            if((block_pos_len+el_len+postfix_len) < 120){
                // ENSURE NO NEW LINE ON FIRST ELEMENT
                if(blocks[block_pos] === ""){
                    blocks[block_pos] = blocks[block_pos] + el
                } else {
                // ENSURE NEW LINE ON CONSECUTIVE INPUTS
                    blocks[block_pos] = blocks[block_pos] + "\n" + el
                }
                
            }else{
            // IF BLOCK IS FULL MOVE TO THE NEXT ONE
                blocks[block_pos] = blocks[block_pos] + postfix
                block_pos += 1
                blocks[block_pos] = el 

            }

            // IF LAST ELEMENT HANDLE DIFFERENTLY
            if( i === menu_variable_arr_len-1 ){
                blocks[block_pos] =  blocks[block_pos] + "\n" + prev + menu_static 
            } 
            
        })
        

        blocks= blocks.map(title=> title )
        return blocks;
        
    } else {
        return full_text;
    }
   
}