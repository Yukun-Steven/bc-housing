
import asyncio

from zealty import search_zealty


async def main():
    properties = await search_zealty("vancouver-city")

    for property in properties:
        print(property)
        print("-" * 60)


if __name__ == "__main__":
    asyncio.run(main())