module.exports = {
    parseError: function (err) {

        let errorCodes = {
            "08003": "connection_does_not_exist",
            "08006": "connection_failure",
            "2F002": "modifying_sql_data_not_permitted",
            "57P03": "cannot_connect_now",
            "42601": "syntax_error",
            "42501": "insufficient_privilege",
            "42602": "invalid_name",
            "42622": "name_too_long",
            "42939": "reserved_name",
            "42703": "undefined_column",
            "42000": "syntax_error_or_access_rule_violation",
            "42P01": "undefined_table",
            "42P02": "undefined_parameter",
            "23505": "violates_unique_constraint"
        };

        if (err === undefined) {
            console.log("No errors returned from Postgres")
        }
        else {
            console.log('Error code details:', errorCodes[err.code])
        }
    }
}