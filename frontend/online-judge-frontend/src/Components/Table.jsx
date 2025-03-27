import React, {useState} from 'react'

const Table = ({heading, items}) => {

    const [ selectedIndex , setSelectedIndex ] = useState(-1);

    const handleClick = (index , items) => {
        setSelectedIndex(index);
        console.log(items);
    }

    return (
        <>
            <h1 className="text-red-600 font-bold text-2xl m-4">Hello {heading}!!</h1>
            <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">
                                Product name
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            items.map((items , index) => (
                                <tr onClick={() => handleClick(index , items )} key={items} className={`
                                ${selectedIndex === index ? 'bg-red-800' : 'bg-white border-b dark:bg-gray-800 dark:border-gray-200 border-gray-200'}
                                `}>
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {items}
                                    </th>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        </>
    )
}

export default Table