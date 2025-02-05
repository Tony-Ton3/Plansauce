import React from 'react'
import { useState } from "react";


const Dashboard = () => {
    const [checked, setChecked] = useState({
        stack1: false,
        stack2: false,
        stack3: false
    });

    const toggleChecked = (stackName) => {
        if (!checked[stackName]) {
            setChecked({ ...checked, [stackName]: true });
        } else {
            setChecked({ ...checked, [stackName]: false });
        }
    }

    return (
        <div className='flex flex-col items-center h-full bg-gradient-to-tr from-secondary to-accent px-20 justify-center space-y-2'>
            <div className="flex flex-col justify-center items-center gap-4 max-w-[60rem]">
                <div className="collapse collapse-arrow border-2 backdrop-blur-md">
                    <input type="radio" name="stack1" checked={checked.stack1} onClick={() => toggleChecked("stack1")} />
                    <div className="collapse-title text-xl font-medium"></div>
                    <div className="collapse-content">
                        <div className='flex w-full overflow-scroll justify-center gap-4'>
                            <div className="w-40 h-24 bg-white rounded-md "></div>
                            <div className="w-40 h-24 bg-white rounded-md "></div>
                            <div className="w-40 h-24 bg-white rounded-md "></div>
                            <div className="w-40 h-24 bg-white rounded-md "></div>
                        </div>
                    </div>
                </div>
                <div className="collapse collapse-arrow border-2">
                    <input type="radio" name="stack2" checked={checked.stack2} onClick={() => toggleChecked("stack2")} />
                    <div className="collapse-title text-xl font-medium"></div>
                    <div className="collapse-content">
                        <p>hello</p>
                    </div>
                </div>
                <div className="collapse collapse-arrow border-2">
                    <input type="radio" name="stack3" checked={checked.stack3} onClick={() => toggleChecked("stack3")} />
                    <div className="collapse-title text-xl font-medium"></div>

                    <div className="collapse-content">
                        <p>hello</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard