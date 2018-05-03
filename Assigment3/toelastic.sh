python csv_to_elastic.py \
        --elastic-address 'search-test-53ovxqlaqknuaw6gkz5jfvjqaq.us-east-1.es.amazonaws.com' \
        --csv-file input.csv \
        --elastic-index 'index5' \
        --datetime-field=dateField \
        --json-struct '{
            "id" : "%id%",
            "cuisine" : "%cuisine%",
            "score" : "%score%"
        }'