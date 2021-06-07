# USSD MENU BUILDER WITH REDIS

This project has been built to demonstrate a nodeJS USSD menu builder with redis. As a result of encountering several issues when developing menus with [ussd-menu-builder](https://www.npmjs.com/package/ussd-menu-builder), we developed a more adaptable library.


## Problem Statement

This USSD menu builder seeks to fix the following issues that we have encountered when building USSD menus.

    1. State dependency
    2. Poor menu configuration options (multi-language and Dynamic input support)
    3. Poor adaptability (Pagination and dynamic content handling)

### 1. State dependency
On the library [ussd-menu-builder](https://www.npmjs.com/package/ussd-menu-builder), given ``20 states`` and lets say we are currently on ``state 10`` on the list, any input provided at this state will trigger all previous states to run. As the states increase so are the number of hops done to run the current state. if an error occurs in one of the previous states it causes a chain reaction on all upcoming states. 

This is certainly bad design. Each state should run independently without bothering others. We solve this problem by ensuring any input provided at ``state 10`` only triggers the function that runs on the current state.


### 2. Poor menu configuration options
* Menus should be built with multi language support to cut down development time. 
* Menus should also support different Mobile Network Operators (MNOs) Input types. 
    * Some MNOs support chained inputs (1*2*3) while allow sending of one value at a time.
    * Some MNOs allow sequential requests while others don't support it

### 3. Poor adaptability 
Menus should be adaptable and easy to configure new functionalities such as pagination and dynamic menu content without performing hacks and work arounds

These are the key features that have been solved in this Library


> Note: We have borrowed heavily from the [ussd-menu-builder](https://www.npmjs.com/package/ussd-menu-builder) to build several components on the solution.


## Project requirements
To use this project you will require:
* Install nodeJS > v10
* Install typescript globally **`npm install -g typescript`** and **`npm install -g ts-node`**
* Set up a redis server  


## Project structure
Here is a summary of the project layout.

```
project    
└───menu-builder
│   └───configs
│   └───core
│   └───lang
│   └───menus
│   └───states
│   └───typings
└───index.ts
```

### Project configurations
Project has a set of base configurations that are located in the ``configs/index.ts`` file.
* session_prefix - This unique identifier that is used to build sessions
* default_lang - Default language used in the project
* session_time - Period in which session will run
* start_state - Identity of the 1st state that runs
* sequential_requests - Set whether the project should allow user to run sequential querries eg. *144*1*3*6#. This allows for MNOs do not allow this operation

### Project core operations
1. Input manager - This allows developer to build custom input managers depending on the MNO being served. For example some MNOs chain inputs (1*2*4*4) while others allow single value entry for consecutive requests. 
2. Terminator - destroys the redis session once the session time runs out

### Project language manager
Manages all language files to be used in a project. 

### Menu operations
Manage all operations that aid id creating what will be displayed to the customer.
* Menu renderer - Builds the menu text from the state config and the language config
* Menu middleware - Actions that can be performed before menus are called. Override operations can be configured here eg. Whenever user types ``0`` perform a special operation

### State operations
Manage states and state controllers (Functions that run when a state is called)

### Typings
Manage project interfaces


## State Management
A `state` in USSD app would be the stages that a user experiencing while navigating the menus eg:

```
CON Please enter your National Identification Number (NIN)
__________________________________________________________
```

This would be a state labeled ``enter_national_id`` state which would require a user to submit the respective national ID.

State properties include:
* State name - a unique value that identifies a state eg. (``start_state``, ``user_new``) Note: use ``snakecase``
* State Controller - a function that runs whenever that state is called. The controller must accept input and redis parameters
* State type - Determines the type of state. Ideally there exist 2 types of states: 
    * Entry State: Allows user to input anything eg ``Enter your firstname``
    * Select State / Count: User selects from a given set eg ``Select your bank \n 1. Eco bank \n 2. Barclays bank``
* Menu Options(optional) - If the state type is of type select/count provide the menu options available as an array with the following details.
    * id - An identifier for the menu option
    * active - identify if the option is still active to deactivate set to false
    * action - identify the state that runs once the option is selected
    * end(optional) - Determines if the state is an end state. Set to true if state ends
* Input sensitivity(optional) - Ensures data passed when state is run is obfuscated in logs. eg. ``Enter your PIN number`` data will log as ``SENSITIVE``

State example:
```javascript
// STATE TYPE COUNT
insure: {
    type: "count",
    menu_options: [
        {
            id: "1",
            active: true,
            action: "third_party_cover"
        },
        {
            id: "2",
            active: true,
            action: "travel_sure"
        }
    ],
    // CONTROLLER EXAMPLE
    run: async(input, redis: RedisClient) => await goNext(input, redis),
},
// STATE TYPE ENTRY
first_name: {
    type: "entry",
    run: async(input, redis: RedisClient) => await firstNameEntry(input, redis),
},

```

### Writing a state controller

A state controller is just a function that runs whenever a specific state is called. State controllers accept input params and a redis client.

There are preset state controllers such as ``start controller`` ( The 1st controller that runs when a USSD API is called) and ``go next controller`` ( This allows you to automatically go to the next state set on menu options)

> Note: The start state controller is compulsory

```javascript
export async function firstnameController(input: InputAttributes, redis: RedisClient) {
    // DO WHATEVER YOU WANT
    
    return {
        next: true,
        invalid_input: false,
        next_screen: operation.action,
        variables: {},
        end: false
    }
}
```
As seen in the code above a state controller returns an object with the following properties:
* next - Indicates whether menu should proceed to the next state. If true provide the ``next_screen`` property.
* next_screen - The value on the next state to run.
* variables - Active variables that need to be passed to the next screen. Come up with a naming convention.
* invalid_input(optional) - indicate whether an invalid input has been provided. 
* end(optional) - indicate whether the states have come 2 an end. set true to end menu, false to continue.
* continue(optional) - Used only when building middleware states. If set to true it allows menu to move on.

When passing variables to the next state ensure you store values as active variables on redis to ensure they can be re used whenever an error occurs on the next state.

```javascript
// SET ACTIVE STATE VARIABLES
const setActiveVariables = await hmsetAsync(input.sid+":"+input.hash+":active_variables", "s1", `${user.first_name} ${user.last_name}` );

        return {
            next: true,
            next_screen: 'user_exists',
            variables: {
                "s1": `${user.first_name} ${user.last_name}`
            }
        }

```

on the next state if an error occurs we can still display the active variables
```javascript
// FETCH ACTIVE VARIABLES 
const active_variables = await hgetallAsync(input.sid+":"+input.hash+":active_variables")

// IF NOT NUMBER RETURN INVALID INPUT
if(!Number(input.current_input)){
    return {
        next: false,
        invalid_input: true,
        // USE ACTIVE VARIABLES
        variables: active_variables ? active_variables : {},
    }
    
}

```


### Writing a state language output

This library supports multi language support. Language files should have generic properties that can be used through out the project as shown below
```javascript
generic: {
    fatal_error: "An error occurred executing your request, please try again later.",
    deny_sequential_requests: "Sequential requests eg: *1*2*3 are not allowed",
    input_violation: "Input pattern is not supported.",
    bad_input: "Invalid input\n",
}
```

Language file should also map each state alongside parameters that are required to display state contents. State name must match the state name set on the state file. State language confirm to the state types. Therefore the are state language for entry and select/ count states.
```javascript

// SELECT / COUNT STATE EXAMPLE
 user_new: {
    "variable": "Welcome to Old Mutual Nigeria. You are currently not registered.",
    "static": "%d",
    "menu_options": {
        "1": "\n%c Enter BVN",
        "2": "\n%c Enter National ID number"
    }
}
// ENTRY STATE EXAMPLE
user_exists: {
    "variable": "Welcome to Old Mutual Nigeria %s1, please enter your secret 4 digit PIN code to login."
}
```
State language have the following properties:

* variable - This is text that can be paginated
* static - This is text that cannot be paginated and must always be displayed
* menu_options - These are options that are used by the count state. the property key should match the state menu_options id number. 

> Notice ``%c`` is used to display the count value dynamically, ``%d`` is where the menu option list will be displayed. You can pass variables to be diplayed like ``%s1``. This will be replaced with value set on property ``s1`` 



## Session Management
Sessions are used to maintain data that can be passed across several states.


### Session Variables
These are values that can be stored for use across multiple states. Some key properties stored on the session include:
* Session hash - Used as an identifier for each session. they are time based
* Session language - Maintains the language being used
* Active State - Maintains the state that is currently selected
* Start time - Stores the session start time 
* Full input - Current input in full eg. "111\*3\*4*5"
* Last input - Previous input value
* Masked input - Input with hidden sensitive data "111\*SENSITIVE\*4*SENSITIVE"

> Note: Developer is free to store any value on the session
```javascript
const hmsetAsync = promisify(redis.hmset).bind(redis)
const updateActiveState = await hmsetAsync(input.sid, "firstname", input.current_input);
```

### Session Entries
This is a  list of all the values that have been passed while navigation the menus.
Syntax is ``state_name`` + ``:`` + ``current_input``. Sensitive values are hidden.
```javascript
[
    "start_state:1",
    "first_name:Moses",
    "enter_pin:SENSITIVE",
]
```

### Session Screens
This is a  list of all the pages the user has interacted with in order from beginning to end.
```javascript
[
    "Welcome to Old Mutual Nigeria CHIMEZIE EJEHU, please enter your secret 4 digit PIN code to login.",
    "Wrong PIN, please try again.",
    "1 Insure with us\n2 Invest with us\nView My Portfolio"
]
```

### Session Active Variable
These are the active variables that are in use by the active states. Create a naming convention for the variables
```javascript
{
    "s1": "Joseph", 
    "s2": "Musk", 
}
```

Session variables, entries and screens build part of what would be considered for logging to a database.