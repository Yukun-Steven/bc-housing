import asyncio

from mcp import ClientSession
from mcp.client.streamable_http import streamable_http_client


ZEALTY_URL = "https://www.zealty.ca/api/mcp"


async def main():
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
                    "cityOrRegion": "vancouver-city",
                    "province": "BC",
                    "limit": 5,
                },
            )

            #print("Zealty search result:")
            #print()

            #print("Is error:", result.is_error)
            #print()
            #print("Structured content:")
            #print(result.structured_content)
            #print()
            #print("Content types:")
            #for item in result.content:
               #print(item.type)
            if result.is_error:
                print("Zealty returned an error.")
                return

            data = result.structured_content

            if not data or "result" not in data:
                print("No structured data returned.")
                return

            properties = data["result"].get("properties", [])

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

                print(converted)
                print("-" * 60)

if __name__ == "__main__":
    asyncio.run(main())