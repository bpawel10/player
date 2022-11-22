#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use axum::{
    body::Bytes,
    extract::{Path, Query},
    response::IntoResponse,
    routing::get,
    Router,
};
use http::Method;
use m3u8_rs::Playlist;
use std::{
    collections::HashMap,
    net::{Ipv4Addr, SocketAddr},
};
use std::{net::IpAddr, str};
use tower::ServiceBuilder;
use tower_http::cors::{Any, CorsLayer};
use url::Url;

const PROXY_PORT: u16 = 63510;

#[tauri::command]
fn proxify(url: String) -> String {
    let mut proxified_url = Url::parse("http://localhost").unwrap();
    proxified_url.set_port(Some(PROXY_PORT)).unwrap();
    proxified_url
        .join(&format!("proxy/{}", bs58::encode(url).into_string()))
        .unwrap()
        .to_string()
}

async fn proxy_handler(
    Path(path): Path<String>,
    Query(headers): Query<HashMap<String, String>>,
) -> impl IntoResponse {
    let decoded_path = String::from_utf8(bs58::decode(path).into_vec().unwrap()).unwrap();
    let url = Url::parse(&decoded_path).unwrap();
    let client = reqwest::Client::builder()
        .redirect(reqwest::redirect::Policy::none())
        .build()
        .unwrap();
    let request = client
        .get(url.clone())
        .headers((&headers).try_into().unwrap());
    let response = request.send().await.unwrap();
    let url = response.url().clone();

    if let Some(_) = url.to_string().find("m3u8") {
        let text = response.text().await.unwrap();
        let (_, m3u8) = m3u8_rs::parse_playlist(&text.as_bytes()).unwrap();

        let m3u8 = match m3u8 {
            Playlist::MasterPlaylist(mut playlist) => {
                playlist.variants = playlist
                    .variants
                    .into_iter()
                    .map(|mut variant| {
                        // let split: Vec<&str> = variant.uri.rsplitn(2, "/").collect();
                        let mut url = Url::parse(&format!(
                            "http://localhost:{}/proxy/",
                            PROXY_PORT.to_string()
                        ))
                        .unwrap()
                        .join(
                            &(bs58::encode(&url.clone().join(&variant.uri).unwrap().to_string())
                                .into_string()),
                        )
                        .unwrap();
                        if !headers.is_empty() {
                            url.query_pairs_mut().extend_pairs(headers.iter());
                        }
                        variant.uri = url.to_string();
                        variant
                    })
                    .collect();
                let mut bytes = Vec::new();
                playlist.write_to(&mut bytes).unwrap();
                str::from_utf8(&bytes).unwrap().to_owned()
            }
            Playlist::MediaPlaylist(mut playlist) => {
                playlist.segments = playlist
                    .segments
                    .into_iter()
                    .map(|mut segment| {
                        let mut url = Url::parse(&format!(
                            "http://localhost:{}/proxy/",
                            PROXY_PORT.to_string()
                        ))
                        .unwrap()
                        .join(
                            &(bs58::encode(&url.clone().join(&segment.uri).unwrap().to_string())
                                .into_string()),
                        )
                        .unwrap();

                        if !headers.is_empty() {
                            url.query_pairs_mut().extend_pairs(headers.iter());
                        }
                        segment.uri = url.to_string();
                        segment
                    })
                    .collect();
                let mut bytes = Vec::new();
                playlist.write_to(&mut bytes).unwrap();
                str::from_utf8(&bytes).unwrap().to_owned()
            }
        };

        Bytes::from(m3u8)
    } else {
        // TODO: use bytes_stream?
        response.bytes().await.unwrap()
    }
}

async fn proxy_server() {
    let app = Router::new()
        .route("/proxy/:path", get(proxy_handler))
        .layer(
            ServiceBuilder::new().layer(
                CorsLayer::new()
                    .allow_methods([Method::GET])
                    .allow_origin(Any),
            ),
        );
    let addr = SocketAddr::new(IpAddr::V4(Ipv4Addr::LOCALHOST), PROXY_PORT);

    println!("Local proxy is listening on http://{}", addr);

    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}

fn main() {
    tauri::async_runtime::spawn(proxy_server());
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![proxify])
        .run(tauri::generate_context!())
        .unwrap();
}
