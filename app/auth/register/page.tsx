"use client"

import { useForm } from "react-hook-form";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../../../components/ui/form";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { Checkbox } from "../../../components/ui/checkbox";
import Link from "next/link";

type FormData = {
    name: string,
    email: string,
    password: string,
    cpassword: string,
}

export default function Register() {
    const form = useForm<FormData>({
        defaultValues: {
            name: "",
            email: "",
            password: "",
            cpassword: "",
        },
    })

    // const onSubmit = (values: FormData) => {
    //     console.log("Form Data: ", values);
    // }

    const onSubmit = async (data: { name: string, email: string, password: string}) => {
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json"},
                body: JSON.stringify(data),
            });

            if(!res.ok) {
                const error = await res.json();
                throw new Error(error.message || "registration failed");
            }

            const result = await res.json();
            alert("Welcome: " +  result.user.name)

            // save tokens or user data if API returns (localStorage.setItem)
            // router.push("/");
        } catch (err: unknown) {
            if (err instanceof Error) {
                alert(err.message);
            } else {
                alert("Something went wrong");
            }
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center p-6">
            <Card className="w-100 max-w-md">
                <CardHeader>
                    <CardTitle className="text-3xl font-semibold">Register</CardTitle>
                </CardHeader>

                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField 
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input type="text" placeholder="name" {...field}/>
                                        </FormControl>
                                    </FormItem>
                                )}    
                            />

                            <FormField 
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="m@example.com" {...field}/>
                                        </FormControl>
                                    </FormItem>
                                )}    
                            />

                            <FormField 
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="********" {...field}/>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField 
                                control={form.control}
                                name="cpassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="********" {...field}/>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <Checkbox id="terms"/>
                            <label htmlFor="terms" 
                                className="text-sm font-normal p-2 leading-none"    
                            >Accept <b>Terms & Conditions</b></label>
                            <Button type="submit" className="w-full">Register</Button>
                            <h3 className="text-center">
                                Already have an account? <Link href="/auth/login" className="underline" >Login</Link> 
                            </h3>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}