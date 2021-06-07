export default {
    generic: {
        fatal_error: "An error occurred executing your request, please try again later.",
        deny_sequential_requests: "Sequential requests eg: *1*2*3 are not allowed",
        input_violation: "Input pattern is not supported.",
        bad_input: "Invalid input\n",
    },
    internal_error: {
        "variable": "An error occurred executing your request, please try again later."
    },
    // BELOW IS A SELECT / COUNT CONFIG EXAMPLE
    // user_new: {
    //     "variable": "Welcome to Bold Utual. You are currently not registered.",
    //     "static": "%d",
    //     "menu_options": {
    //         "1": "\n%c Enter BVN",
    //         "2": "\n%c Enter National ID number"
    //     }
    // }

    // BELOW IS AN ENTRY CONFIG EXAMPLE
    // user_exists: {
    //     "variable": "Welcome to Old Mutual %s1, please enter your secret 4 digit PIN code to login."
    // }
}