"use client"

import { useForm } from "react-hook-form";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../../components/ui/form";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema =  z.object({
    email: z.string(),
    password: z.string().min(8, "Password must be at least 8 characters!")
})

export default function Register() {
    const router = useRouter();
    
    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        mode: "onChange",
        defaultValues: {
            email: "",
            password: "",
        },
    })

    // const onSubmit = (values: FormData) => {
    //     console.log("Form Data: ", values);
    // }

    const onSubmit = async (data: { email: string, password: string}) => {
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json"},
                body: JSON.stringify(data),
            });

            if(!res.ok) {
                const error = await res.json();
                throw new Error(error.message || "login failed");
            }

            const result = await res.json();
            alert("Welcome: " +  result.user.name)

            // save tokens or user data if API returns (localStorage.setItem)
            router.push("/");
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
                    <CardTitle className="text-3xl font-semibold">Login</CardTitle>
                </CardHeader>

                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField 
                                control={form.control}
                                name="email"
                                render={({ field, fieldState }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="m@example.com" {...field}/>
                                        </FormControl>
                                        <FormMessage className="text-red-500" />
                                        {fieldState.error && (
                                            <p className="text-red-500 text-sm">{fieldState.error.message}</p>
                                        )}
                                    </FormItem>
                                )}    
                            />

                            <FormField 
                                control={form.control}
                                name="password"
                                render={({ field, fieldState }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="********" {...field}/>
                                        </FormControl>
                                        {fieldState.error && (
                                            <p className="text-red-500 text-sm">{fieldState.error.message}</p>
                                        )}
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full">Login</Button>
                            <h3 className="text-center">
                                Do not have an Account? <Link href="/auth/register" className="underline">Register</Link> 
                            </h3>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}