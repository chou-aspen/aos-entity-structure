import json
import requests
import msal
import pandas as pd
from typing import List
from .utils import create_attribute_payload
import os
import logging
from pathlib import Path
from dotenv import load_dotenv
dotenv_path = Path('.env').resolve()
load_dotenv(dotenv_path=dotenv_path)
DYNAMICS_AUTHORITY = os.environ.get('DYNAMICS_AUTHORITY')
DYNAMICS_CLIENT_ID = os.environ.get('DYNAMICS_CLIENT_ID')
DYNAMICS_CLIENT_SECRET = os.environ.get('DYNAMICS_CLIENT_SECRET')
DYNAMICS_RESOURCE_URL = os.environ.get('DYNAMICS_RESOURCE_URL')
DYNAMICS_SCOPES = os.environ.get('DYNAMICS_SCOPES')


class DynamicsAPI:
    """
    This class is the DynamicsAPI, which contains methods relevant to Dynamics.
    """

    def __init__(self, logger=None) -> None:
        # Use provided logger or create a default one
        self.logger = logger or logging.getLogger(__name__)
        self.msal_app = self._build_msal_app()
        self.session = self.create_http_session()
        self.headers = {
            "OData-MaxVersion": "4.0",
            "OData-Version": "4.0",
            "Accept": "application/json",
            "Content-Type": "application/json; charset=utf-8",
        }
        # print("DynamicsAPI Class initialized")
        self.logger.info("DynamicsAPI Class initialized")

    def _build_msal_app(self) -> msal.ConfidentialClientApplication:
        """
        Returns the MSAL app with the client's credentials

        :return: An instance of ConfidentialClientApplication
        """

        return msal.ConfidentialClientApplication(
            client_id=DYNAMICS_CLIENT_ID,
            authority=DYNAMICS_AUTHORITY,
            client_credential=DYNAMICS_CLIENT_SECRET
        )

    def _get_access_token(self) -> str:
        """
        Returns the access token acquired from MSAL

        :return: Access token string
        """

        scopes = [DYNAMICS_SCOPES]
        token = self.msal_app.acquire_token_for_client(scopes)
        return token['access_token']

    def create_http_session(self) -> requests.Session:
        """
        Creates a new HTTP session with the Authorization header set 
        with the access token

        :return: A session instance
        """

        access_token = self._get_access_token()
        session = requests.Session()
        session.headers.update({'Authorization': f'Bearer {access_token}'})
        return session

    def retrieve_records(self, table_name: str, guid: str = None, display_columns: List[str] = None) -> pd.DataFrame:
        """
        Retrieves a record's information given table name and optional additional information.

        :param table_name: The logical name of the table, PLURAL FORM!
        :param (OPTIONAL) guid: The guid of the record. If None, it retrieves all records of the table. If provided, it only retrieves ONE row.
        :param (OPTIONAL) display_columns: List of specific columns to retrieve in the format of a list of strings

        :return: Dataframe of the requested information.
        """
        full_url = f'{DYNAMICS_RESOURCE_URL}/api/data/v9.2/{table_name}'
        if guid:
            full_url = f'{DYNAMICS_RESOURCE_URL}/api/data/v9.2/{table_name}({guid})'
            response = self.session.get(full_url, headers=self.headers)
            response_data = json.loads(response.content.decode('utf-8'))
            row_df = pd.DataFrame([response_data])
            return row_df
        # If display_columns columns are provided, only grab those specific columns
        if display_columns:
            columns = ','.join(display_columns)
            full_url += f'?$select={columns}'

        response = self.session.get(full_url, headers=self.headers)
        response_data = json.loads(response.content.decode('utf-8'))

        # Check if 'value' key exists in response, if not log detailed response
        if 'value' not in response_data:
            self.logger.error(f"Missing 'value' key in Dynamics API response")
            self.logger.error(f"Full URL: {full_url}")
            self.logger.error(f"HTTP Status Code: {response.status_code}")
            self.logger.error(f"Response Headers: {dict(response.headers)}")
            self.logger.error(
                f"Response Content: {response.content.decode('utf-8')}")
            self.logger.error(f"Parsed Response Data: {response_data}")

            # Re-raise the KeyError with more context
            raise KeyError(
                f"'value' key not found in Dynamics API response. Status: {response.status_code}, Response: {response_data}")

        response_df = pd.DataFrame(response_data['value'])
        return response_df

    def get_access_token(self) -> str:
        """
        Public method to get access token (for enhanced MCP server compatibility)

        :return: Access token string
        """
        return self._get_access_token()

    def query_entity(self, entity_name: str, params: dict = None) -> dict:
        """
        Query entity with OData parameters (for enhanced MCP server compatibility)

        :param entity_name: The logical name of the entity (plural form)
        :param params: Dictionary of OData query parameters like $select, $filter, $orderby, $top, $count
        :return: Dictionary containing the query results with 'value' key and optional '@odata.count'
        """
        try:
            # Build the full URL
            full_url = f'{DYNAMICS_RESOURCE_URL}/api/data/v9.2/{entity_name}'

            # Add OData query parameters
            if params:
                query_parts = []
                for key, value in params.items():
                    if key.startswith('$'):
                        # OData system parameters
                        query_parts.append(f"{key}={value}")
                    else:
                        # Custom parameters
                        query_parts.append(f"{key}={value}")

                if query_parts:
                    full_url += '?' + '&'.join(query_parts)

            self.logger.info(f"Querying entity: {full_url}")

            # Make the request
            response = self.session.get(full_url, headers=self.headers)

            # Check for HTTP errors
            if response.status_code != 200:
                self.logger.error(f"HTTP {response.status_code}: {response.text}")
                raise Exception(f"HTTP {response.status_code}: {response.text}")

            # Parse response
            response_data = json.loads(response.content.decode('utf-8'))

            # Ensure we return the expected format
            if 'value' not in response_data:
                # If it's a single record response, wrap it in 'value' array
                if isinstance(response_data, dict) and '@odata.context' in response_data:
                    response_data = {'value': [response_data]}
                else:
                    self.logger.error(f"Unexpected response format: {response_data}")
                    raise Exception(f"Unexpected response format from Dynamics API")

            return response_data

        except Exception as e:
            self.logger.error(f"Error querying entity {entity_name}: {e}")
            raise e

    # def create_string_column(self,
    #                          entity_logical_name: str,
    #                          column_logical_name: str,
    #                          column_display_name: str,
    #                          label: str = "",
    #                          max_length: int = 1000) -> None:
    #     """
    #     Creates a new string column in the specified Dynamics 365 entity.

    #     :param entity_name: The name of the Dynamics 365 entity
    #     :param column_name: The name of the new column
    #     :param display_name: The display name of the new column
    #     :param max_length: The maximum length of the string. Default is 1000.
    #     """

    #     url = f"{DYNAMICS_RESOURCE_URL}/api/data/v9.2/EntityDefinitions(LogicalName='{entity_logical_name}')/Attributes"

    #     additional_properties = {"MaxLength": max_length}
    #     attribute_payload = create_attribute_payload("String", "StringType", column_display_name, column_logical_name, additional_properties)
    #     response = self.session.post(url, headers=self.headers, data=json.dumps(attribute_payload))

    # def create_datetime_column(self,
    #                            entity_logical_name: str,
    #                            column_logical_name: str,
    #                            column_display_name: str,
    #                            datetime_format: str = "DateOnly") -> None:
    #     """
    #     Creates a new DateTime column in the specified Dynamics 365 entity.

    #     :param entity_name: The name of the Dynamics 365 entity
    #     :param column_name: The name of the new column
    #     :param display_name: The display name of the new column
    #     :param datetime_format: The DateTime format of the new column. Default is 'DateOnly'. Another option is "DateAndTime"
    #     """

    #     url = f"{DYNAMICS_RESOURCE_URL}/api/data/v9.2/EntityDefinitions(LogicalName='{entity_logical_name}')/Attributes"

    #     additional_properties = {"Format": datetime_format, "DateTimeBehavior": {"Value": datetime_format}}
    #     attribute_payload = create_attribute_payload("DateTime", "DateTimeType", column_display_name, column_logical_name, additional_properties)
    #     response = self.session.post(url, headers=self.headers, data=json.dumps(attribute_payload))

    # def create_integer_column(self,
    #                         entity_logical_name: str,
    #                         column_logical_name: str,
    #                         column_display_name: str,
    #                         min_value: int = 0,
    #                         max_value: int = 100) -> None:
    #     """
    #     Creates a new Integer column in the specified Dynamics 365 entity.

    #     :param entity_logical_name: The logical name of the Dynamics 365 entity
    #     :param column_logical_name: The logical name of the new column
    #     :param column_display_name: The display name of the new column
    #     :param min_value: The minimum value of the new column. Default is 0.
    #     :param max_value: The maximum value of the new column. Default is 100.
    #     """

    #     url = f"{DYNAMICS_RESOURCE_URL}/api/data/v9.2/EntityDefinitions(LogicalName='{entity_logical_name}')/Attributes"

    #     additional_properties = {
    #         "MaxValue": max_value,
    #         "MinValue": min_value,
    #         "Format": "None",
    #         "SourceTypeMask": 0
    #     }

    #     attribute_payload = create_attribute_payload(
    #         "Integer", "IntegerType", column_display_name, column_logical_name, additional_properties
    #     )

    #     response = self.session.post(url, headers=self.headers, data=json.dumps(attribute_payload))

    # def create_decimal_column(self,
    #                         entity_logical_name: str,
    #                         column_logical_name: str,
    #                         column_display_name: str,
    #                         min_value: float = 0.0,
    #                         max_value: float = 100.0,
    #                         precision: int = 1) -> None:
    #     """
    #     Creates a new Decimal column in the specified Dynamics 365 entity.

    #     :param entity_logical_name: The logical name of the Dynamics 365 entity
    #     :param column_logical_name: The logical name of the new column
    #     :param column_display_name: The display name of the new column
    #     :param min_value: The minimum value of the new column. Default is 0.0.
    #     :param max_value: The maximum value of the new column. Default is 100.0.
    #     :param precision: The number of decimal places for the new column. Default is 1.
    #     """

    #     url = f"{DYNAMICS_RESOURCE_URL}/api/data/v9.2/EntityDefinitions(LogicalName='{entity_logical_name}')/Attributes"

    #     additional_properties = {
    #         "MaxValue": max_value,
    #         "MinValue": min_value,
    #         "Precision": precision
    #     }

    #     attribute_payload = create_attribute_payload(
    #         "Decimal", "DecimalType", column_display_name, column_logical_name, additional_properties
    #     )

    #     response = self.session.post(url, headers=self.headers, data=json.dumps(attribute_payload))
    #     # print(response.json())
    #     self.logger.info(f"Response: {response.json()}")

    # def create_table_row(self,
    #                      table_name: str,
    #                      data: dict) -> None:
    #     """
    #     Creates a new row in a Dynamics 365 table.

    #     :param table_name: The name of the Dynamics 365 table (PLURAL FORM!)
    #     :param data: data in dictionary format. For example {"cre90_aclandedtoinverters": 5}
    #     """
    #     try:
    #         url = f"{DYNAMICS_RESOURCE_URL}/api/data/v9.2/{table_name}"
    #         response = self.session.post(url, headers=self.headers, data=json.dumps(data))
    #         response.raise_for_status()
    #         # print(f"Table row has been created for table {table_name}")
    #         self.logger.info(f"Table row has been created for table {table_name}")
    #     except Exception as ex:
    #         # print("error from create_table_row:", ex)
    #         self.logger.error(f"error from create_table_row: {ex}")
    #         # print(f"Response content: {response.content.decode('utf-8')}")
    #         self.logger.error(f"Response content: {response.content.decode('utf-8')}")

    # def update_table_row(self, table_name: str, row_id: str, update_data: dict) -> None:
    #     """
    #     Updates an existing row in a specified Dynamics 365 table.

    #     :param entity_name: The logical name of the Dynamics 365 entity, PLURAL FORM
    #     :param row_id: The unique identifier (ID) of the row to be updated.
    #     :param update_data: A dictionary containing the properties and their new values.
    #                         For example, {"name": "New Name", "creditonhold": False}
    #     """
    #     try:
    #         # Construct the URL for the Dynamics 365 API endpoint.
    #         url = f"{DYNAMICS_RESOURCE_URL}/api/data/v9.2/{table_name}({row_id})"
    #         # print(f"[DYNAMICS] Attempting to update table: {table_name}, row_id: {row_id}")
    #         self.logger.info(f"Attempting to update table: {table_name}, row_id: {row_id}")
    #         # print(f"[DYNAMICS] Update URL: {url}")
    #         self.logger.info(f"Update URL: {url}")
    #         # print(f"[DYNAMICS] Update data: {update_data}")
    #         self.logger.info(f"Update data: {update_data}")

    #         # Send a PATCH request to update the specified record.
    #         response = self.session.patch(url, headers=self.headers, data=json.dumps(update_data))

    #         # print(f"[DYNAMICS] Response status code: {response.status_code}")
    #         self.logger.info(f"Response status code: {response.status_code}")

    #         response.raise_for_status()
    #         # print(f"[DYNAMICS] Successfully updated table {table_name} for row {row_id}")
    #         self.logger.info(f"Successfully updated table {table_name} for row {row_id}")

    #         # Log response content if any (usually empty for successful PATCH)
    #         if response.content:
    #             # print(f"[DYNAMICS] Response content: {response.content.decode('utf-8')}")
    #             self.logger.info(f"Response content: {response.content.decode('utf-8')}")

    #     except Exception as ex:
    #         # print(f"[DYNAMICS] Error during update_table_row for table {table_name}, row_id {row_id}: {ex}")
    #         self.logger.error(f"Error during update_table_row for table {table_name}, row_id {row_id}: {ex}")
    #         # print(f"[DYNAMICS] Response content: {response.content.decode('utf-8')}")
    #         self.logger.error(f"Response content: {response.content.decode('utf-8')}")

    def get_all_entity_definitions(self) -> dict:
        """
        Retrieves all entity definitions (metadata) from Dynamics 365.
        Returns entity information including LogicalName, DisplayName, and other metadata.

        :return: Dictionary containing all entity definitions
        """
        try:
            url = f'{DYNAMICS_RESOURCE_URL}/api/data/v9.2/EntityDefinitions?$select=LogicalName,SchemaName,DisplayName,PrimaryIdAttribute,PrimaryNameAttribute,EntitySetName,IsCustomEntity,IsActivity,Description'
            self.logger.info(f"Fetching entity definitions from: {url}")

            response = self.session.get(url, headers=self.headers)

            if response.status_code != 200:
                self.logger.error(f"HTTP {response.status_code}: {response.text}")
                raise Exception(f"HTTP {response.status_code}: {response.text}")

            response_data = json.loads(response.content.decode('utf-8'))
            return response_data

        except Exception as e:
            self.logger.error(f"Error fetching entity definitions: {e}")
            raise e

    def get_entity_relationships(self, entity_logical_name: str) -> dict:
        """
        Retrieves all relationships (One-to-Many, Many-to-One, Many-to-Many) for a specific entity.

        :param entity_logical_name: The logical name of the entity
        :return: Dictionary containing all relationship types
        """
        try:
            url = f"{DYNAMICS_RESOURCE_URL}/api/data/v9.2/EntityDefinitions(LogicalName='{entity_logical_name}')?$expand=OneToManyRelationships,ManyToOneRelationships,ManyToManyRelationships"
            self.logger.info(f"Fetching relationships for entity: {entity_logical_name}")

            response = self.session.get(url, headers=self.headers)

            if response.status_code != 200:
                self.logger.error(f"HTTP {response.status_code}: {response.text}")
                raise Exception(f"HTTP {response.status_code}: {response.text}")

            response_data = json.loads(response.content.decode('utf-8'))
            return response_data

        except Exception as e:
            self.logger.error(f"Error fetching relationships for {entity_logical_name}: {e}")
            raise e

    def get_all_relationships(self) -> dict:
        """
        Retrieves all relationships across all entities in a more efficient way.
        Returns consolidated relationship data.

        :return: Dictionary containing relationship information
        """
        try:
            # Fetch RelationshipDefinitions which includes all relationships
            url = f'{DYNAMICS_RESOURCE_URL}/api/data/v9.2/RelationshipDefinitions'
            self.logger.info(f"Fetching all relationship definitions")

            response = self.session.get(url, headers=self.headers)

            if response.status_code != 200:
                self.logger.error(f"HTTP {response.status_code}: {response.text}")
                raise Exception(f"HTTP {response.status_code}: {response.text}")

            response_data = json.loads(response.content.decode('utf-8'))
            return response_data

        except Exception as e:
            self.logger.error(f"Error fetching all relationships: {e}")
            raise e
