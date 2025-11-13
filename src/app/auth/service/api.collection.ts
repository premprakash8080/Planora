import { environment } from "src/environments/environment";

export const ENDPOINTS = {
    Login:environment.apiBaseUrl+'/api/users/authorise',
    forgot_password:environment.apiBaseUrl+'/api/users/forgot/password',
    API_ENDPOINT_VERIFY_TOKEN : environment.apiBaseUrl +'/api/users/validate/token',
    API_ENDPOINT_RESET_PASSWORD: environment.apiBaseUrl +'/api/users/reset/password',
    get_permissions_by_role_id :environment.apiBaseUrl+'/api/roles/get_permissions_by_role_id'
}