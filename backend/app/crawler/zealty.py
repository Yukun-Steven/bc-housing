
from mcp import ClientSession
from mcp.client.streamable_http import streamable_http_client


ZEALTY_URL = "https://www.zealty.ca/api/mcp"


async def search_zealty(city: str, limit: int = 5):
    async with streamable_http_client(ZEALTY_URL) as (
        read_stream,
        write_stream,
    ):
        async with ClientSession(
            read_stream,
            write_stream,
        ) as session:
            await session.initialize()

            result = await session.call_tool(
                "search_listings",
                arguments={
                    "status": "active",
                    "cityOrRegion": city,
                    "province": "BC",
                    "limit": limit,
                },
            )

            if result.is_error:
                raise RuntimeError("Zealty returned an error.")

            data = result.structured_content

            if not data or "result" not in data:
                raise RuntimeError("No structured data returned.")

            response_data = data["result"]
            properties = response_data.get("properties", [])

            converted_properties = []

            for property in properties:
                converted = {
                    "address": property.get("streetAddress"),
                    "city": property.get("city"),
                    "postal_code": property.get("postalCode"),
                    "property_type": property.get("type"),
                    "price": property.get("listingPrice"),
                    "bedrooms": property.get("bedroomCount"),
                    "bathrooms": property.get("bathroomCount"),
                    "floor_area": property.get("houseSize"),
                    "latitude": property.get("latitude"),
                    "longitude": property.get("longitude"),
                    "listing_url": property.get("url"),
                }

                converted_properties.append(converted)

            # Keep the original disclosure supplied with this response.
            original_text = response_data.get("text", "")
            disclosure = ""

            marker = "NOTE: This representation is based in whole or in part"

            if marker in original_text:
                disclosure = original_text[
                    original_text.index(marker):
                ].strip()

                if disclosure.startswith("*") and disclosure.endswith("*"):
                    disclosure = disclosure[1:-1]

            return {
                "properties": converted_properties,
                "disclosure": disclosure,
            }