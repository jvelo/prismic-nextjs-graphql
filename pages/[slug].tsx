import withApollo from "../src/with-apollo";
import {usePageQuery} from "../queries/page.graphql";
import {RichText} from 'prismic-reactjs';
import {linkResolver} from "../src/links";
import {useRouter} from "next/router";
import htmlSerializer from "../src/prismic";
import React from "react";

function Page() {
    const router = useRouter();
    const {slug} = router.query;

    const {data, error, loading} = usePageQuery({
        variables: {slug: slug as string}
    });

    if (loading) {
        return <div>Loading ... ⏲</div>
    } else if (!data) {
        return <div>Oh no :( 👎</div>
    }

    return data && <div>
        <RichText render={data.page.title}
                  linkResolver={linkResolver}
                  htmlSerializer={htmlSerializer}
        />

        <RichText render={data.page.content}
                  linkResolver={linkResolver}
                  htmlSerializer={htmlSerializer}
        />

        <footer>
            The prismic repository associated with this project is: <code>{process.env.PRISMIC_REPOSITORY}</code>
        </footer>
    </div>
}

export default withApollo(Page);
