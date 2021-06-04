export interface InputArgs{
    phoneNumber: string,
    serviceCode: string,
    text: string,
    sessionId: string
}

export interface InputAttributes{
    full_input: string,
    current_input: string,
    masked_input: string,
    active_state: string,
    sid: string,
    language: string,
    phone: string, 
    hash: string, 
}