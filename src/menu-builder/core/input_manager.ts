export default function(last_input: string, incoming_input: string){

    // THIS FUNCTION IS USED TO MANAGE ALL INCOMING INPUTS
    // TODO: WRITE CODE THAT ACHIEVES THE INPUT STYLE YOU DESIRE DEPENDING ON THE MNO
    
    // AFRICAS TALKING EXAMPLE
    // FOR AFRICAS TALKING FIND THE DIFFERENCE BETWEEN LAST INPUT AND INCOMING INPUT
    // GIVES THE CURRENT INPUT
    // EXAMPLE last_input = 1*2*3  incoming_input = 1*2*3*4 therefore current_input = 4
    
    if(last_input.length >= incoming_input.length){
        // ENSURE LAST INPUT IS LESS THAN THE CURRENT INPUT
        return {
            end: true,
        }
    }

    const findDiff = (str1, str2) => { 
        if (str1.length === 0){
            return str2
        } else if(str2.length === 0){
            return str1
        }
        else{
            let diff= "";
            str2.split('').forEach(function(val, i){
              if (val != str1.charAt(i))
                diff += val ;         
            });
            return diff.substr(1, diff.length);
        }
    }

    return {
        end: false,
        input: findDiff(last_input, incoming_input)
    }


}